const nodemailer=require('nodemailer');
const transport=nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gulati.malika@tftus.com',
    pass: 'nghvczubvktvuink',
  },
});
module.exports={
  transport,
};
