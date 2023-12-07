require('dotenv').config()

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const saltRounds = 10;
const app = express();

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(`mongodb+srv://admin-mohammed:${process.env.PASSWORD}@cluster0.c4wkhb3.mongodb.net/myDB?retryWrites=true&w=majority`)
app.use(session({
    secret: `${process.env.SECRET}`,
    resave: false,
    saveUninitialized: false
}));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    country: String,
    telephone: Number,
    status: String,
    daily: []
});


const User = mongoose.model("user", userSchema);

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect("/")
    }
}
app.get("/", async (req, res) => {

    if (req.session.isAuth) {
        res.redirect("/dashbord")
    } else {
        const allStudents = await User.find({});
        res.render("index.ejs", { students: allStudents })
    }

})
app.get("/register", async (req, res) => {

    if (req.session.isAuth) {
        res.redirect("/dashbord")
    } else {
        res.render("register.ejs", { message: "" })
    }
})
let studentNameNew;
app.post("/register", async (req, res) => {
    const username = req.body.name;
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const userCountry = req.body.country;
    const userTelephone = req.body.telephone;
    const userStatus = req.body.status;
    const checkUser = await User.find({ email: userEmail }); // return array of objects
    // let studentName = checkUser[0].name;

    let allStudents = await User.find({});


    if (checkUser.length === 0) {
        if (userEmail === "admin@admin.com") {
            bcrypt.hash(userPassword, saltRounds, function (err, hash) {
                const newUser = new User({

                    name: username,
                    email: userEmail,
                    password: hash,
                    country: userCountry,
                    telephone: userTelephone,
                    status: userStatus,

                })
                newUser.save()
            });


            req.session.isAuth = true;
            // let adminAccount = await User.findOneAndUpdate({ email: "admin@admin.com" }, { daily: [{ datum: "10-02-1987" }] })



            res.redirect("/admin/page");
        } else {

            bcrypt.hash(userPassword, saltRounds, function (err, hash) {
                const newUser = new User({

                    name: username,
                    email: userEmail,
                    password: hash,
                    country: userCountry,
                    telephone: userTelephone,
                    status: userStatus,

                })
                newUser.save()


            });
            req.session.isAuth = true;
            studentNameNew = username;
            // send email 

            var nodemailer = require('nodemailer');

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'mas.webdev24@gmail.com',
                    pass: `${process.env.PASS_AUTH}`
                }
            });

            var mailOptions = {
                from: 'mas.webdev24@gmail.com',
                to: `${userEmail}`,
                subject: 'تم تسجيلك بنجاح في الدورة المجانية 🎉',
                html: `<div dir="rtl"><h2  style="color:green">مرحبا  ${username} 👋</h2> <h3>شكرا على تسجيلك في الدورة المجانية. لقد تم تسجيل بياناتك بنجاح في قاعدة البيانات. 👍</h3> <hr> <h2>ستبدأ الدورة بأذن الله <span style="color:red">يوم الجمعة المصادف 12-01-2024 الساعة السابعة بتوقيت مصر ⏰🗓</span></h2> <h3> استخدم هذا الرابط للدخول في كروب الواتس اب : https://chat.whatsapp.com/EzAFg7e5Xb7JgYSGl20T0T 📣</h3> <h3>اضف نفسك ايضاً في مجتمع الواتسب اب لكي تحصل على التحديثات بخصوص الدورة المجانيه : https://chat.whatsapp.com/LpmFkZ8u51k99oouSNHPnA 👉</h3><h3>اذا كنت غير مشترك على قنانتنا على اليوتيوب فبأمكانك الاشتراك معنا عبر هذا الرابط : https://www.youtube.com/@codingwithmo8716 لكي يصلك كل ما هو جديد 🎬</h3><h3>نتشرف بانضمامك معنا على صفحة الفيس بوك : https://www.facebook.com/profile.php?id=100086427609254 📜</h3><br><br><p>مع تحيات</p><p>فريق عمل Coding with MO</p></div>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.redirect("/dashbord")

        }


    } else if (userEmail === checkUser[0].email) {
        res.render("register.ejs", { message: "لا يمكن تسجيل هذا البريد الالكتروني . هذا البريد مسجل في قاعدة البيانات. اختر بريد اخر.⛔" })

    }



})

app.post("/dashbord", async (req, res) => {

    let userEmail = req.body.email;
    let userPassword = req.body.password;
    let checkUser = await User.findOne({ email: userEmail });


    if (checkUser) {
        if (checkUser.email === "admin@admin.com") {
            bcrypt.compare(userPassword, checkUser.password, function (err, result) {
                if (result) {
                    req.session.isAuth = true;

                    res.redirect("/admin/page")
                } else {
                    res.redirect("/")
                }
            });
        }

        if (checkUser.email !== "admin@admin.com") {
            bcrypt.compare(userPassword, checkUser.password, function (err, result) {
                if (result) {
                    req.session.isAuth = true;
                    let nameOfStudent = checkUser.name

                    res.render("dashbord.ejs", { studentName: nameOfStudent, studentDaily: checkUser })

                } else {
                    res.redirect("/")
                }
            });
        }

    } else {
        res.redirect("/")
    }





})


app.get("/dashbord", isAuth, async (req, res) => {



    res.render("dashbord.ejs", { studentName: "", studentDaily: "", studentNameNew: studentNameNew })
})



app.get("/admin/page", isAuth, async (req, res) => {
    let allStudents = await User.find({});


    // let adminAccount = await User.findOneAndUpdate({ email: "admin@admin.com" }, { daily: [{ datum: "10-02-1987" }] })
    res.render("admin.ejs", { students: allStudents });
})
app.post("/:edite", async (req, res) => {

    let infoStudent = await User.findOne({ _id: req.params.edite });
    let allStudents = await User.find({})

    res.render("edite.ejs", { detailsStudent: infoStudent, allStudents: allStudents })
})
app.post("/update/dailyupdate", async (req, res) => {
    let date = req.body.date;
    let link = req.body.link;
    let linkName = req.body.linkName;
    let link2 = req.body.link2;
    let linkName2 = req.body.linkName2;
    let link3 = req.body.link3;
    let linkName3 = req.body.linkName3;
    let note = req.body.note;
    let aanofafwijzig = req.body.aanofafwijzig;
    let studentID = req.body.seeID;

    let empytArray = []
    let infoStudent = await User.findOne({ _id: studentID });
    infoStudent.daily.forEach(item => {
        empytArray.push(item)
    })

    let myArray = { date: date, link: link, link2: link2, link3: link3, linkName: linkName, linkName2: linkName2, linkName3: linkName3, note: note, aanofafwijzig: aanofafwijzig }
    if (date && link && linkName && note && aanofafwijzig) {
        empytArray.push(myArray);
        await User.updateOne({ _id: studentID }, { daily: empytArray });
    }





    let afterUpdate = await User.findOne({ _id: studentID });
    res.render("editedaily.ejs", { detailsStudent: afterUpdate });

});


// اكمل من هنا
app.post("/update/edite-daily-for-student", async (req, res) => {

    let studentDate = req.body.studentDate;
    let studentLink = req.body.studentLink;
    let linkName = req.body.linkName;
    let studentLink2 = req.body.studentLink2;
    let linkName2 = req.body.linkName2;
    let studentLink3 = req.body.studentLink3;
    let linkName3 = req.body.linkName3;
    let studentNote = req.body.studentNote;
    let studentAanofafwijzig = req.body.aanofafwijzig;

    let newDate = { date: studentDate, link: studentLink, link2: studentLink2, link3: studentLink3, linkName: linkName, linkName2: linkName2, linkName3: linkName3, note: studentNote, aanofafwijzig: studentAanofafwijzig }
    let studentID = req.body.studentID;
    let getValueOfStudent = await User.findOne({ _id: studentID });
    let newArray = []
    getValueOfStudent.daily.forEach(obj => {
        newArray.push(obj)
    })
    let emptyArrayNew = []
    let filterByDate = getValueOfStudent.daily.filter(x => x.date === studentDate) // array of objects of this date
    filterByDate.forEach(obj => {
        emptyArrayNew.push(obj)
    })

    let searchForDateIndex = newArray.findIndex(date => date.date === studentDate); //2


    newArray.splice(searchForDateIndex, 1, newDate)

    await User.updateOne({ _id: studentID }, { daily: newArray })
    // let afterFiltered = getValueOfStudent.daily.filter(x => x.date === studentDate);


    let afterUpdate = await User.findOne({ _id: studentID });
    res.render("editedaily.ejs", { detailsStudent: afterUpdate });

})

app.post("/abc/update", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const country = req.body.country;
    const telephone = req.body.telephone;
    const status = req.body.status;
    await User.findOneAndUpdate({ email: email }, { name: name, email: email, country: country, telephone: telephone, status: status })
    res.redirect("/admin/page")
})
app.post("/delete/student", async (req, res) => {
    const studentId = req.body.student_id;
    await User.deleteOne({ _id: studentId });
    res.redirect("/admin/page")
})


app.post("/update/all", async (req, res) => {
    let d = new Date();
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();

    // let date = day + "-" + month + "-" + year + " / " + year + "-" + month + "-" + day
    let date = day + "-" + month + "-" + year
    await User.updateMany({}, { $push: { daily: { date: date, link: "لا يوجد", note: "لا يوجد", aanofafwijzig: "off" } } })

    res.redirect("/admin/page")

})
app.post("/abc/logout", async (req, res) => {
    await req.session.destroy(err => {
        console.log(err)
    })
    res.redirect("/")
})
app.listen(3000, () => {
    console.log("Server is running on port 3000!")
})