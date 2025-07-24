const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;


// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Nodemailer transporter (replace with your real email & app password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bituzelalem@gmail.com',
    pass: 'wzhe zgnl afhv yzvn' // <-- app-specific password
  }
});

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, 'public/menu.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/order', (req, res) => res.sendFile(path.join(__dirname, 'public/order.html')));
app.get('/reservation', (req, res) => res.sendFile(path.join(__dirname, 'public/reservation.html')));
app.get('/testimonials', (req, res) => res.sendFile(path.join(__dirname, 'public/testimonials.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public/contact.html')));

app.get('/admin', (req, res) => {
  const filePath = path.join(__dirname, 'reservations.json');
  if (!fs.existsSync(filePath)) {
    return res.send('<h1>Admin Panel</h1><p>No reservations found.</p><a href="/">Back to Home</a>');
  }

  const data = fs.readFileSync(filePath);
  const reservations = JSON.parse(data);

  let tableRows = reservations.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.guests}</td>
      <td>${new Date(r.timestamp).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <h1>Admin Panel - Reservations</h1>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Date</th>
        <th>Time</th>
        <th>Guests</th>
        <th>Submitted At</th>
      </tr>
      ${tableRows}
    </table>
    <a href="/">Back to Home</a>
  `;

  res.send(html);
});

// Handle reservation form
app.post('/reservation', (req, res) => {
  const { name, email, date, time, guests } = req.body;

  // Save to file
  const reservation = { name, email, date, time, guests, timestamp: new Date() };
  const filePath = path.join(__dirname, 'reservations.json');
  let reservations = [];

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    reservations = JSON.parse(data);
  }

  reservations.push(reservation);
  fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));
  console.log('✅ Reservation saved to file');

  // Fancy HTML email
  const mailOptions = {
    from: 'bituzelalem@gmail.com',
    to: email,
    subject: '✨ Your Reservation at Feru Bar and Restaurant ✨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="text-align: center; color: #b4442f;">🍷 Feru Bar and Restaurant 🍽️</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for your reservation! Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Guests</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${guests}</td>
          </tr>
        </table>
        <p style="margin-top: 15px;">We can't wait to serve you! If you need to make changes, just reply to this email or contact us at <a href="mailto:bituzelalem@gmail.com">bituzelalem@gmail.com</a>.</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 0.9em; color: #555; text-align: center;">Feru Bar and Restaurant, 123 Main Street, YourCity, USA</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email failed:', error);
    } else {
      console.log('📧 Fancy email sent:', info.response);
    }
  });

  // Show confirmation page
  res.send(`
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 30px; background-color: #fff8f0; border: 2px solid #b4442f; border-radius: 12px; text-align: center;">
    <h1 style="color: #b4442f;">🍷 Thank you, ${name}!</h1>
    <p style="font-size: 1.1em; color: #333;">
      Your reservation for <strong>${guests}</strong> guest(s) on <strong>${date}</strong> at <strong>${time}</strong> has been received.
    </p>
    <p style="margin-top: 15px; color: #555;">
      We’ve sent a confirmation email to: <strong>${email}</strong>
    </p>
    <a href="/" style="display: inline-block; margin-top: 25px; padding: 10px 20px; background-color: #b4442f; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
      ⬅️ Back to Home
    </a>
  </div>
`);

});

// Existing register and order routes
app.post('/register', (req, res) => {
  console.log('Registered:', req.body);
  res.send('Registration successful!');
});

app.post('/order', (req, res) => {
  console.log('Order placed:', req.body);
  res.send('Order placed successfully!');
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
