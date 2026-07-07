import csv from "csvtojson";
import xlsx from "xlsx";
import ApiError from "../utils/ApiError.js";
import Contact from "../models/Contact.model.js";

const parseCsvBuffer = async (buffer) => {
    const text = buffer.toString("utf8");
    const contacts = await csv({ trim: true }).fromString(text);
    return contacts.map((row) => ({
        name: String(row.name || row.Name || "").trim(),
        phoneNumber: String(row.phoneNumber || row.phone || row.Phone || "").trim(),
    }));
};

const parseExcelBuffer = async (buffer) => {
    const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
    return rows.map((row) => ({
        name: String(row.name || row.Name || "").trim(),
        phoneNumber: String(row.phoneNumber || row.phone || row.Phone || "").trim(),
    }));
};

const createContact = async (req, res) => {
    const { name, phoneNumber } = req.body;

    const contact = await Contact.create({
        name,
        phoneNumber,
        shopkeeper: req.user._id,
    });

    return res.status(201).json({
        success: true,
        message: "Contact created successfully",
        data: contact,
    });
};

const uploadContacts = async (req, res) => {
    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "No file uploaded");
    }

    const allowedMimeTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const fileExtension = req.file.originalname
        ? req.file.originalname.toLowerCase().split(".").pop()
        : "";
    const extension = fileExtension ? `.${fileExtension}` : "";

    if (
        !allowedMimeTypes.includes(req.file.mimetype) ||
        !allowedExtensions.includes(extension)
    ) {
        throw new ApiError(400, "Invalid file type. Please upload CSV or Excel files only.");
    }

    let contacts = [];
    try {
        if (extension === ".csv") {
            contacts = await parseCsvBuffer(req.file.buffer);
        } else {
            contacts = await parseExcelBuffer(req.file.buffer);
        }
    } catch (error) {
        throw new ApiError(400, "Failed to parse uploaded file");
    }

    const validContacts = contacts.filter(
        (contact) => contact.name && contact.phoneNumber
    );

    if (!validContacts.length) {
        throw new ApiError(400, "Uploaded file contains no valid contacts");
    }

    const createdContacts = await Contact.insertMany(
        validContacts.map((contact) => ({
            ...contact,
            shopkeeper: req.user._id,
        })),
        { ordered: false }
    );

    return res.status(201).json({
        success: true,
        message: `${createdContacts.length} contacts imported successfully`,
        data: createdContacts,
    });
};

const getContacts = async (req, res) => {
    const contacts = await Contact.find({ shopkeeper: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Contacts retrieved successfully",
        data: contacts,
    });
};

export { createContact, uploadContacts, getContacts };
