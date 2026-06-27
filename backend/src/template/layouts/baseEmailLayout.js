const baseEmailLayout = ({ title, content, buttonText = "", buttonUrl = "" }) => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body{
    margin:0;
    padding:40px;
    background:#f4f6f8;
    font-family:Arial,Helvetica,sans-serif;
}

.container{
    max-width:600px;
    margin:auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,.08);
}

.header{
    background:#25D366;
    color:#fff;
    padding:25px;
    text-align:center;
}

.header h1{
    margin:0;
}

.content{
    padding:35px;
    color:#333;
    line-height:1.7;
}

.button{
    display:inline-block;
    margin-top:20px;
    padding:14px 28px;
    background:#25D366;
    color:#fff !important;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
}

.footer{
    background:#fafafa;
    text-align:center;
    padding:20px;
    color:#888;
    font-size:13px;
}
</style>

</head>

<body>

<div class="container">

<div class="header">
<h1>🤖 AI WhatsApp CRM</h1>
</div>

<div class="content">

<h2>${title}</h2>

${content}

${
buttonUrl
? `<a class="button" href="${buttonUrl}">
${buttonText}
</a>`
: ""
}

</div>

<div class="footer">

© ${new Date().getFullYear()} AI WhatsApp CRM

</div>

</div>

</body>

</html>
`;
};

export default baseEmailLayout;