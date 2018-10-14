const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
// for adding additional fields for password in schema and methods for login

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address!'], // [ validation, error msg]
    required: 'Please supply an email address.'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [
    { type: mongoose.Schema.ObjectId, ref: 'Store' }
  ]
});

//adding a virtual field to our schema - something that can be generated, rather than storing that in data
// it is not actually stored in the database
userSchema.virtual('gravatar').get(function() {
  // const hash = md5(this.email); // md5 is a hasing algorithm that takes the user's email and produces a gravatar
  // return `https://gravatar.com/avatar/${hash}?s=200`;
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgKDRAICAgJCAgJCAoICAkJCBsICQcKIB0iIiAdHx8kKCgsJCYlJx8fLTEtJTU3MC4uIx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIALEAsQMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgMEAAIHAf/EAEUQAAIBAgQDBQQGCAUBCQAAAAECAwARBAUSISIxQQYTMlFhQnGBkRQjUmKSoRUWM3KTscHRNFNU4fCCByRjZXN0lMLx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALogxOl3GIlHdre3eelH8ixErQqxdnNmBLG7V5hcMqxSpiUdXeO0dlJ1N08/Sg+DxOYwjuY8NJpU82jNA2Cd/O3od6zvH877edqXBj8yvb6MSLchGdVX8rfH4iUYeVFw91L3eM6mX50F8JGDfQhfqSLtW2oeQB62Wh+eLj8Gw0d3MHDMCkZDChLZtmAP7BbDqYz/AHoGOWYDiO/uHFS12h7RPEDHG95SPwCqGa57jFXQ4WMldhp0M1LE0rysXc3JbiJ+zQTNK8xMj8bXub/0rJHPtCxHlUcSkbjce/lW/dM3PcdQOdBJh8P31+YIBINU2Uq2kb2Lb3piy6G8R0bOVsBQTFRlWs4sb3NhQRROfeQL7irsU224sfMdaqKD/wBVrC3tVag+/sQOdA7dkc/wqWweNCGMm0crLr0H1p8iwOA2dYISDZlIUG6+lcMaQKQ6NY3sd6N5f2mxkMfdd5cKOEkXstB2DuMPa3dx257xivVgww5Rxj3LXKoe1ONflKpPh06an/WLH/buLrcheVB1BUhHIIL+QFe/Vj7IrmK9oMxY6Ue7HkAoqT9K5sf8zn/lmg6LiHi0m5BGm29c/wC0OFV5FROAFWNlFr1mFxmazusIJGtgLtHw0cXs7i2kWSbEpKitxALxW9KBW/Qk/nJ+KvK6L+jR5H/nxrKCGQcug09Kh7oEcrjzoBmPal0JMESNGCygsTQd+3WJW6jDxnn15/nQO8EWlw1rrZhf71aZhtMnc+Pu33+Ipe7Pdp8VjJlhkhiROJiVHFy99HzJrxSC1vqpDy58qCaASyX71RcbDatp40jQu2kALckjlVxUPkbelLfbnGnCYRt7PM3cx78XmaDmvabMfpWKZ03jVmWMDwsKFoCTsvzrVm3v0uxH3qK5Jlskz3tZLi96CxleWPKbkGxsQKZ8HkCEbrYW9o70SyzApGoHDcheQowiAW9KAFFkSLumx+S0LzrIdX1kfO24I8VOugc60mhDCxoOSzYZ4mIcbrzGmoZcQLaRa52vanntDlWoGaMWYA6h93zpHx2FKXcbAXttQUtZB879K2SRh5AE+lQb73Ft97ezWA/O9ASgliXUzamuo0ldmDda3wZlkYL3jBXPDxcVDlLHlsfWrmHxDrGNCWkjbib7vSgZMpxIwcuucNJw2AHipgw/aTDSX0Ybe50hmAb+VIk8sjnWz2bSuwNTYHGSRA72e7WP2aBzPaK/7PBlSviLMNI921Fsl7RwsxbEuYriwZrlfhXNcTn0zxmJwzNewkAtaocqx0iyDvJmERN2BN1oO2fprLv9VD+Ksrmn6Rwv2x/DrKC/kGDwOMiKzSsZ9xpYhFBpex2FGFmeAxIxDMNxZhWYB5orursjR6Xa2zWq/nuOSZYsUkJEwXRM4ACs3Q0Fnsqi9+kmnRZmUqPD1p1hMSYtTbUDBLv8qUckA+qcbEau89KO4eT/AL0nEGvHILA8XSgaHxQHIdOtcl/7Rc5fFYj6MthHh7qtvC7dfysPhXSsTIdDPb2SR8q4jmsjyTSO3N5WJoNcqwpxDhOnWw4qf8rwUcYCgfZ5jioD2XwhRe9cbsQR7qbYCi8yFN9r0BKFeXTYVbiHy9apwunRgT5X3q5Eb/8A5QSha0cW9fSrCJt5VHKm1BQxKBlO1+GxFJ2cZaI3PSKTwki6o1Ozke80OzDDLMhQi4tztupoOYZrlzwktay9QD4aFm46/GugYjDq18NOFLhW7tyLXHQUm5nhe5kKBeG9xQVIWuRc9LXqwqOL8Wkl7W56qqgW+dEcvOueMncFgLaRvQbk2PFy2FxWwZ3voAK2sbG7UX+gQrIG03Goizb9PKqGGiLYkpHrBu2lU8TUA5sKTfQ2s3Y6Bd2rTDI4JLBgg2PCdqPZKvHIW1BwzLxG7LV/E4YCATaVAE31l/D6UC9qXyH4aype+X0/DWUF7Ga42NgRfqONWq3gUhxClcVM0MaEWYR6960GLwrvplksL8yvDUeNx+HYtDhtkFgWGwvQMGEmynDLpXEu7lbX7srtU+X4iGTErJC+saWFgLMtJyCSVgkal3J0hdNy7elGezySQ4jRIkkcgU6lK7rQN2Y4t1HAl00tdfZPnXL8z+slUaAANJGkW1V0TOZ+7w0hG57pgL1z6HVKoNiXjk3Y78NA14OPu4QVXfuxZQOI7Vvh8DiJrs8mi52v7NWMIPqweZCgCqGPzPFQkRYaF9ZNi7pojT1oCByLFDijxLG29XMJLi4bJM+sX2NrMtLf6XzVC6HGxXjaPu0MVlxDHy26UeweKmlW06caqCyg3UmgNxYrzNzzsKhxGYMo2S7W2FqihVWXXaxAtzqGadV47eEMLnw0FOTF5q5JTDADisAvFp86jafH85YinuFYM+xasyR4OJyIjMRJiO7Zl9Nq0/WONmVMTD3DTLqUhtcdBVkljxJ7tlYSDa9rWPnS/wBo8E6rrsGA2DWs1OAiiYmVBc2uCDddNB+0ovCdO9z19mgS8qwS4mUQyS90nES1r6avxYH6Li0jurgG6t7JXzrbIY9EneEXQKbnp76mxM6yYgTewjBVstASeT61E073dhxc9q27JRD6a8sgv3ayaTfw+XyrQqzSxMF1HiLHT0tWYOebBd5ioUR3ZmjAcX4fSgr5cbyzHnqnk3v8quY0YpcLJqeMwNMule74lqhkcMxDYkpZDO0bMRfS25pskwkMmXzvM2gCRBqHiTlQc81+hrKJ9xgP9Uv4a9oKGYwGJjqNm6XqCJ9J20m/MU34rAJipA/DoABI6mtsTkuV209y0bEWDhieLz50EPYgCTEd4Ye8MKmSym2nper2cTiLMS6LeV4vaPjbypXhmxOBkeON+7BDQSEe2vpV7KVMk6ySG+kG1zrvQGu0M7DBuzjSxVQQDdRSllE90eK9idJBPVb00dpuLCN5XUbUjYOYQyKehZdQP2etB0vKOKNeuy3FFJcKHHkfXrQnJXRo1ZDdSLrbqvSmCLa1+tAMGVb+CMDzC8VTfRo8Oh0BSxG5tzoixAF+W3U0MmxKO3djiN7XFBLDfu/K4rRYEmQxuOfO9WAvD5Ai1RJNErBb7k2NAPfJIr3aISC2lbtfhqaPKoBbVDHYWsCt9VGFPXmPStHAHw5GgosiKtlRVHkABSvn7al7sc9XIezTViW25WpXxUXe4gJyKm5uLqtBQxyR4bCEgaGkAC7cTe6l6OTVwryBuT5VYz7HPNJ3avqjg4F34T0PyqjgSzGyjUSCLDegZIn+sh3sCpuOXleskkBhezLf6Qw2azc6rYmV4TDKE12LIQ3hvt/vU0eWyYiE2hEczyd4rNIEW3zoLmU4qIYdsNdhN+kGk5WXTaiOMzeGDCnBTQtKmLkG6t3egUKXIM0wmiZjEyS6rMZO9Um3vow2SR4mFYcVPh0xZbUpXjKL6gX/ADoBf6Ewf2T/APJFZVz9Rv8AzTD/AMM/3rKCLJZ9Si53tyvV+Yjk7Lt0NuGhGXKkZCxurleG/Jb+tGYsuixa3ZyW6mM8PuoF7OoVZxMjKQygMAfaqxlWF0/XPNGBe2kyXb4UUxnZvDquoPKT6mo8N2ci06i8l9WldLdKCvn7J9GZdag3BsG4qQzz9dVr079p8uTD4cspYnUqnVvSO27b7WoOhdm5lEEfUBLXFM0WJUi17eppJ7IYgNF3d7mN7Efd6U1iAkXF7bEEeVB7iZ3kuq7C9tQNVYXEZ0OdJLbMa2kxeGwx0TEKT9qonx+Dfkb72BtfTQFzi0CeZBoXO4kIEZudVyQOVYrYM8WtSL73bhrdMbg1vxr5X+z60E8GKkjsj7jzNXWxItfrbcUHnzLBuQiSAueim7VMiOy8RYG3DcWaglxcw87X32pK7QZjNh2PcmzOpDHqFpqmXTfXc9bGufdopxJM1jcIbGgHM3nuSWJIrfDs4Idedzv7VQ3t1/rUqHcdQfI2oDM8rth17zcCSyk+LnRLBiZ0QQvHxbAFRqU0JZX7tRuFA1XIuKrnFSImpGAAa9guycv96A5ozVsScHD3kmIRmKxK31ai3MAVZinziGQTDDRmePUBxWbT1vYmlrLsdjBL3sM3dTcr35CnaDLs0ngbFTJBOgYKpjm0M7X93nQDv1mzj/LH8I1lWdGY/wCgH4jWUAmHGRicSaQqavCBwmnXKsVhpGCRGNLqAwsOJvSucwYB2IBnjtqJF5aY+zeHkw7Bu8ikvzJnAt8yKBiznMEjbuYo+9dRcE7R/GqeF7QwiyPCytfiCvdlalvtFPNDKxE11cq1u8DsvyJoMmZuTzBNrE7ajQM/bXM4ZoFSHUGMmoqRakVm9Ku47EmSwJuPIm6rVFwRYc+poCfZvHGCUfYc6Tfbi6V07L8Ssi2J2sCN640pI5bEG/ip37M5vrAhfaQbWPUedA1Zpl0c6E6AzWuKFYKaCO0OJw4IQsuofVn0o9h5BIvPfTY1TxmXKxva5JvsOVBPGcn2fhBKW02obicThwDHBhEJMenvGHtdfyrf6BINrnR02qxBl1iGPEepIoIspy1Ae+dVDXuAFsaKzqii7fZsPSt0VYx7hQvMcXa/FYdGPhWgG57mCQxs+rcDY+zXOp5NTF25uzNtRftRi3dlS5VCWYgdaBHoOYHW9qDbbzsR5VJH06i9aE2+Sje1WMONVhyufw0F6HFKVCO5CqrcvZqJu5+iyWKmYyx6QfEw9KJ4hI4Y4XCKQGPeDSH1LQfGRoH4ADHI10Zfs0HmUuysQkTSniXb2a6r2JxckmD+iSQSo4n0iQR/VncVz3srhj33kLNpubV2bs9hligC2sTIWPvoJPoUv+Yf4hrKI/P51lByfCZPl07EwCR419s8CtRSLIcuXxwsT+8RSXh+1iRLp7iYkeU4Rf5VtL2v1bDDn/qxF/6UDlNkOVPwmEFfI715F2fyaMcSRHrdl3pCk7USEWEKi56yb/yqL9OzSHSIwL29qgzPTF37iBVSMMyoAOGhzk7W5ct6kmZi1/Fc3PpWkhBsORtbegi9+9/SreBZ4nWUOVOoCwNtqrwpqIF9+gNFTh+AsBcqb8vSgdsozHkHNtWnemQMrjVfYjoKScrVZIwCGB08/aDUbwuKmh4GOuO1ifaWgYFQW23sOorQj4CqAzJGHiIPkahnx0jDRAjMerHgW1BLmmMWNbXuT4bUBm1S3eRtMYvYEc6IR4JmJlxLmRvZUeFaHZ5PoQjYbHhHs0CRnc3eTHoBqUC3DVBeVxub9fDVjEJq1MehvVcDbc2FBsB7iQb2opkyQtMFmayHxAm2qhakbbem9FcgxKRzgy20uNFz+VAwZllqYlB9GxEaiI8Mcklu8Hof715k+Sof8QCJlN1VWUw6fWmPBYWIousa0IVrA8NEEwOGUbwIwPQx3tQUMtyN1lE11KAHUVU6kpzwmJUDu1w06gbaynCT86BHB6d4S8LEc0NrUsY/tHn+DlbCiRZtHhkEYdZV9aDp/ffck/DWVyn9ce0P/h/wTXtBzhgduEj3Vrb4HoQabc8wKOt4XWMWv3egBT7v96VzHpvzJuRYj86DxFW9ydRGxJ5LU0YW+2xHlW2GwM0pCRIztqvYDh+dWZsDJhtpuB2BNvIXoK1/SxBvc7V49/Q+grxd778jzv0r1jz5b8qC9lkSklzYnhtf+VHFw/1Deeq5J2VfShWUx6gEsACym499OMGGTQY5BZWUAkD2bdKCjkwK2vuOVr0fSG4/O1DYcG0babAAbKQdakeY3+dHMGt7DkdNiD7VBqkI8rnpt4qkVLezVtIh7x61sYb/AA5feoB+KfStx7zSjnLGTnycsAL22pwzBbA7XNjcAezalLM0KsWcABVuq3vw+VAo40aQx5DVp51TUXFW8yOwC2AvqYAVVte1jbbegyxv59LCthwnbb/61qosed7m/wC9XpB/4aDqfZHGfScIuonWhWNx7VNEY28wPxVzT/s8xzLM2EY8MoLqSfarpkbH4dPvUFbMmZYZNGzGJwpHiU9K97P5WmFiBZLzy8cznc+tTMuo6WF1JF/3qIRjp0ttag10L9kfhrKmtWUHI1lhlAFgWKgabXY1dy/sKZX+kYmRkRmLiIeIj/nSqfYaCTFTLNIgEcTXuPbNdOVLD086AJFlOGwad3BCEKLcMBbV61zbtTJfEsgN9A0muo5xPoUm9rBix51x7MpWlmkkNrNIbNegpna1uRrCfPn0rUnl0F/LlU0S6mHU9QRQMPZ6EM4uLDQOvWnQxXTzFrXHipY7KwXk0n2RTo0Wm3QWtagH5ViXQGGaMTRarqCbNF7vfRaFcPsUkKXIuH9mh2Hi1MRawB2vV4xgAC9/hQXQEA/aoRp9f7V7eMeEtIeGwUWV6gjHx3vyrZ2PTe9ANzaeRTZNMSorMWU8TDyJpTzMfVhBdg7cRNMuYxNJIE9k8wu4PpQHtAoTZbgRxk8/aoEnGi7Eltr2tUA6AcxtUsykgt11fiqND6c9VBhHz9TWNbrWE+lya8/nfegKdnJzDi4ZVJsJV1eo5V2mLiGrlcbVw/LmtKnmGW1drwTFokPUxrzoJltq8+JaIp/ShUrWKb21SqdvcaJKdr+lBJcVlR6vWvKBP7J4RMNCigWOgM23tU1XFj86B4EWA2sAFoi8nBc7G1jvQLXa/GLFA55M4KrXK5GJv8zenLt5jdTjDA3Khnff8qSx7rfGgwG/rcE3q9lS3ced6oW5DlRbJ47FX5hiaBw7Kw3kLdSv9acIYSxCPuCwv7qX+ysQsWPXZSOnOmyBbMG6AUA/EYEwvdOOMnc+0D5Vmm/pbyo0wuL8xWj4VG9NuYoBYHr+VesNqttgXHha+9xesTBn2zv5CgDxqGdntcayKWu1KlYpXO5aRUuOlOkqKjMAmkWvt+dJXa2Qd33V7XxLG/woEjERNwpy2Z9qq267i17UQxIOs+SpYWFUr39OY50Gv/B96st8Dfoa236cvU8VeKBy5fnQEchw5mxCINrtfeuz4GPRCiHciNQb1yzsph27xZivCJlUN96uuJ4R+6tANzB9MkK8r4hdvhRhW29LdaXs5e2Iw99rykkdWo7I9gB+7zoM1e6vKg1GsoBeH5fKp5vCaysoOVdrf8W/xoFWVlBt5Udyvwp8a8rKB/7L/s/4f8qZ05/OvaygsnkK3P8ASsrKDwdPdWgrKygF47xH91qQu1fNf/WNZWUCziOb/u1R/saysoInreDnXlZQOnZL9mv/ALsfyrpa8h+6P5VlZQL/AGg/xeG/fNHcR0+FZWUGtZWVlB//2Q=='
});

// adds all the methods and fields that are needed for us to add authentication for our schema
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
// makes error msgs nicer than default mongodb error msgs
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);