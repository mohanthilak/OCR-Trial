const express = require("express");
const app = express();
const path = require("path");
var multer = require("multer");
//OCR
const { createWorker } = require("tesseract.js");
const worker = createWorker({
  logger: (m) => console.log(m), // Add logger here
});

//multer storing files
var storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.fieldname + path.extname(file.originalname));
  },
});
var upload = multer({ storage: storage });

//setting up the path for the rendering other ejs files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


//routes
app.get("/", (req, res) => {
  res.render("profile");
});


const multipleUpload = upload.fields([
  { name: "product" },
  { name: "options" },
]);
app.post("/profile", multipleUpload, async (req, res) => {
  if (req.files) {
    (async () => {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      async function convert(paths) {
        const {
          data: { text },
        } = await worker.recognize(`./uploads/${paths}`);
        console.log(text);
      }
      await convert(req.files.product[0].filename);
      await convert(req.files.options[0].filename);
      await worker.terminate().then(() => {
        console.log("terminated!");
      });
    })();
  }
});

app.listen(3000, () => console.log("listening at port 3000!"));