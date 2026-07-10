import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sock = null;
let qrCodeData = null;
let isConnected = false;
let connectionError = null;
let chatsCache = new Map();
let messagesCache = new Map();

const authFolder = path.join(__dirname, '../../baileys_auth');

// Ensure auth folder exists
if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
}

const connectToWhatsApp = async () => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            defaultQueryTimeoutMs: undefined,
            markOnlineOnConnect: true,
            syncFullHistory: true, // Enable full history sync
            getMessage: async (key) => {
                // Return stored messages for history sync
                const chatId = key.remoteJid;
                const messages = messagesCache.get(chatId) || [];
                const msg = messages.find(m => m.id === key.id);
                return msg?.message || undefined;
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCodeData = qr;
                console.log('📱 New QR Code generated!');
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode
                    : 500;

                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                const errorMessage = lastDisconnect?.error?.message || 'Connection closed';
                
                console.log('❌ Connection closed:', errorMessage, 'Status:', statusCode);
                
                isConnected = false;
                connectionError = errorMessage;

                // Don't reconnect on conflict or replaced errors
                if (statusCode === 440 || errorMessage.includes('conflict') || errorMessage.includes('replaced')) {
                    console.log('🚫 Session conflict detected - clearing session...');
                    qrCodeData = null;
                    // Clear session on conflict
                    if (fs.existsSync(authFolder)) {
                        fs.rmSync(authFolder, { recursive: true, force: true });
                        fs.mkdirSync(authFolder, { recursive: true });
                    }
                    // Generate new QR after 2 seconds
                    setTimeout(() => connectToWhatsApp(), 2000);
                } else if (shouldReconnect && statusCode !== DisconnectReason.loggedOut) {
                    console.log('🔄 Reconnecting in 5 seconds...');
                    setTimeout(() => connectToWhatsApp(), 5000);
                } else {
                    console.log('🚫 Logged out - need to scan QR again');
                    qrCodeData = null;
                }
            } else if (connection === 'open') {
                console.log('✅ WhatsApp connected successfully via Baileys!');
                isConnected = true;
                qrCodeData = null;
                connectionError = null;
                
                // Load existing chats on connection
                try {
                    console.log('📥 Loading existing chats...');
                    const chats = await sock.groupFetchAllParticipating();
                    const privateChats = Object.values(chats || {});
                    console.log(`📱 Found ${privateChats.length} chats`);
                } catch (error) {
                    console.log('⚠️ Could not load chats:', error.message);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // Listen for incoming messages
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            console.log('📨 Message event:', type, messages.length);
            
            for (const msg of messages) {
                try {
                    const chatId = msg.key.remoteJid;
                    if (!chatId) continue;
                    
                    // Store message in cache
                    if (!messagesCache.has(chatId)) {
                        messagesCache.set(chatId, []);
                    }
                    
                    const text = msg.message?.conversation || 
                                msg.message?.extendedTextMessage?.text || 
                                msg.message?.imageMessage?.caption ||
                                (msg.message?.imageMessage ? '[Image]' : '') ||
                                (msg.message?.videoMessage ? '[Video]' : '') ||
                                (msg.message?.documentMessage ? '[Document]' : '') ||
                                '[Message]';
                    
                    const messageData = {
                        id: msg.key.id,
                        from: chatId,
                        timestamp: msg.messageTimestamp || Date.now() / 1000,
                        text: text,
                        hasMedia: !!(msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.documentMessage),
                        fromMe: msg.key.fromMe || false,
                        message: msg.message, // Store full message for history
                    };
                    
                    messagesCache.get(chatId).push(messageData);
                    
                    // Update or create chat info
                    const contactName = msg.pushName || chatId.split('@')[0];
                    chatsCache.set(chatId, {
                        id: chatId,
                        name: contactName,
                        lastMessage: text,
                        timestamp: messageData.timestamp,
                        unread: !msg.key.fromMe,
                    });
                    
                    console.log('💬 Message from:', contactName, '-', text.substring(0, 50));
                } catch (err) {
                    console.error('Error processing message:', err);
                }
            }
        });

        // Listen for chat updates - this loads existing chats
        sock.ev.on('chats.set', ({ chats }) => {
            console.log('💬 Chats loaded:', chats.length);
            chats.forEach(chat => {
                const chatId = chat.id;
                if (!chatsCache.has(chatId)) {
                    chatsCache.set(chatId, {
                        id: chatId,
                        name: chat.name || chatId.split('@')[0],
                        lastMessage: chat.conversationTimestamp ? 'Tap to load messages' : 'No messages',
                        timestamp: chat.conversationTimestamp,
                        unread: (chat.unreadCount || 0) > 0,
                    });
                }
            });
        });

        // Listen for messages history
        sock.ev.on('messages.set', ({ messages }) => {
            console.log('📜 Message history loaded:', messages.length);
            messages.forEach(msg => {
                try {
                    const chatId = msg.key.remoteJid;
                    if (!chatId) return;
                    
                    if (!messagesCache.has(chatId)) {
                        messagesCache.set(chatId, []);
                    }
                    
                    const text = msg.message?.conversation || 
                                msg.message?.extendedTextMessage?.text || 
                                '[Media]';
                    
                    const messageData = {
                        id: msg.key.id,
                        from: chatId,
                        timestamp: msg.messageTimestamp || Date.now() / 1000,
                        text: text,
                        hasMedia: !!(msg.message?.imageMessage),
                        fromMe: msg.key.fromMe || false,
                    };
                    
                    messagesCache.get(chatId).push(messageData);
                } catch (err) {
                    console.error('Error loading history message:', err);
                }
            });
        });
    } catch (error) {
        console.error('❌ Failed to connect:', error.message);
        connectionError = error.message;
        // Retry after 5 seconds
        setTimeout(() => connectToWhatsApp(), 5000);
    }
};

// Normalize phone number for WhatsApp format
const normalizePhoneNumber = (phoneNumber) => {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.substring(1);
    }
    
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    // WhatsApp format: number@s.whatsapp.net
    return cleaned + '@s.whatsapp.net';
};

// Send text message
const sendTextMessage = async (phoneNumber, text) => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp not connected. Please scan QR code first.');
    }

    const jid = normalizePhoneNumber(phoneNumber);
    
    try {
        await sock.sendMessage(jid, { text });
        return { success: true, jid };
    } catch (error) {
        throw new Error(`Failed to send message: ${error.message}`);
    }
};

// Send image message
const sendImageMessage = async (phoneNumber, imageUrl, caption) => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp not connected. Please scan QR code first.');
    }

    const jid = normalizePhoneNumber(phoneNumber);
    
    try {
        await sock.sendMessage(jid, {
            image: { url: imageUrl },
            caption: caption,
        });
        return { success: true, jid };
    } catch (error) {
        throw new Error(`Failed to send image: ${error.message}`);
    }
};

// Get connection status
const getConnectionStatus = () => {
    return {
        isConnected,
        qrCode: qrCodeData,
        hasAuth: fs.existsSync(path.join(authFolder, 'creds.json')),
        error: connectionError,
    };
};

// Force generate new QR code
const generateNewQR = async () => {
    if (isConnected) {
        throw new Error('Already connected. Please logout first to generate new QR.');
    }
    
    // Clear existing session
    if (fs.existsSync(authFolder)) {
        fs.rmSync(authFolder, { recursive: true, force: true });
        fs.mkdirSync(authFolder, { recursive: true });
    }
    
    qrCodeData = null;
    connectionError = null;
    
    // Reconnect to generate new QR
    await connectToWhatsApp();
    
    return { success: true, message: 'New QR code generated' };
};

// Logout and clear session
const logout = async () => {
    if (sock) {
        await sock.logout();
        sock = null;
    }
    
    // Clear auth files
    if (fs.existsSync(authFolder)) {
        fs.rmSync(authFolder, { recursive: true, force: true });
        fs.mkdirSync(authFolder, { recursive: true });
    }
    
    isConnected = false;
    qrCodeData = null;
    connectionError = null;
    
    return { success: true, message: 'Logged out successfully' };
};

// Get all chats
const getChats = async () => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp not connected');
    }
    
    const chats = Array.from(chatsCache.values())
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    return chats;
};

// Get messages for a chat
const getChatMessages = async (chatId) => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp not connected');
    }
    
    // Try to load messages from WhatsApp if not in cache
    if (!messagesCache.has(chatId) || messagesCache.get(chatId).length === 0) {
        try {
            console.log('📥 Fetching messages for:', chatId);
            // Fetch last 50 messages from WhatsApp
            const messages = await sock.fetchMessagesFromWA(chatId, 50);
            
            if (messages && messages.length > 0) {
                console.log(`📨 Loaded ${messages.length} messages for ${chatId}`);
                const messageList = [];
                
                for (const msg of messages) {
                    if (msg.message) {
                        const text = msg.message.conversation || 
                                    msg.message.extendedTextMessage?.text || 
                                    msg.message.imageMessage?.caption ||
                                    '[Media]';
                        
                        messageList.push({
                            id: msg.key.id,
                            from: chatId,
                            timestamp: msg.messageTimestamp || Date.now() / 1000,
                            text: text,
                            hasMedia: !!(msg.message.imageMessage || msg.message.videoMessage),
                            fromMe: msg.key.fromMe || false,
                        });
                    }
                }
                
                messagesCache.set(chatId, messageList);
            }
        } catch (error) {
            console.log('⚠️ Could not fetch messages:', error.message);
        }
    }
    
    const messages = messagesCache.get(chatId) || [];
    return messages.sort((a, b) => a.timestamp - b.timestamp);
};

// Send message to chat
const sendMessageToChat = async (chatId, text) => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp not connected');
    }
    
    try {
        const result = await sock.sendMessage(chatId, { text });
        
        // Store sent message in cache
        if (!messagesCache.has(chatId)) {
            messagesCache.set(chatId, []);
        }
        
        const messageData = {
            id: result.key.id,
            from: chatId,
            timestamp: Date.now() / 1000,
            text: text,
            hasMedia: false,
            fromMe: true,
        };
        
        messagesCache.get(chatId).push(messageData);
        
        return { success: true, messageId: result.key.id };
    } catch (error) {
        throw new Error(`Failed to send message: ${error.message}`);
    }
};

// Mark chat as read
const markChatAsRead = async (chatId) => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp not connected');
    }
    
    const chat = chatsCache.get(chatId);
    if (chat) {
        chat.unread = false;
        chatsCache.set(chatId, chat);
    }
    
    return { success: true };
};

// Create demo chats from contacts for testing
const syncContactsAsChats = async () => {
    if (!sock || !isConnected) {
        throw new Error('WhatsApp not connected');
    }
    
    try {
        // Import Contact model
        const Contact = (await import('../models/Contact.model.js')).default;
        const contacts = await Contact.find().limit(10);
        
        console.log(`📱 Creating chats from ${contacts.length} contacts...`);
        
        for (const contact of contacts) {
            const phoneNumber = contact.phoneNumber.replace(/\D/g, '');
            let normalized = phoneNumber;
            
            if (normalized.startsWith('0')) {
                normalized = '91' + normalized.substring(1);
            }
            if (!normalized.startsWith('91') && normalized.length === 10) {
                normalized = '91' + normalized;
            }
            
            const chatId = normalized + '@s.whatsapp.net';
            
            // Create chat entry
            chatsCache.set(chatId, {
                id: chatId,
                name: contact.name,
                lastMessage: 'Tap to start conversation',
                timestamp: Date.now() / 1000,
                unread: false,
            });
            
            console.log(`✅ Created chat for: ${contact.name} (${chatId})`);
        }
        
        return { success: true, count: contacts.length };
    } catch (error) {
        console.error('Error syncing contacts:', error);
        throw new Error(`Failed to sync contacts: ${error.message}`);
    }
};

export {
    connectToWhatsApp,
    sendTextMessage,
    sendImageMessage,
    getConnectionStatus,
    generateNewQR,
    logout,
    normalizePhoneNumber,
    getChats,
    getChatMessages,
    sendMessageToChat,
    markChatAsRead,
    syncContactsAsChats,
};
