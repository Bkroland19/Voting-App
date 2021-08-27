const {PrismaClient} = require("@prisma/client")
const express = require("express");
const prisma = new PrismaClient();
const router = express.Router();
let multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken');
const { ensureAuthenticated } = require('./config/auth');
const { nanoid } = require("nanoid");
const LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./scratch");
const fs = require('fs')

let posts = ["Chairman", "ChairLady", "Secretary", "Asst. Secretary", "Financial Secretary",
  "Treasurer", "PRO", "Welfare 1", "Welfare 2", "Librarian", "Librarian 2", "Cross Bearer2",
  "Provost", "Curator 1", "Curator 2"]
let count = 0;
function increaseCount() {
  count += 1
}
let Results = []

let error = []
// image upload
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '-' + file.originalname);
  },
});

let upload = multer({ storage: storage });

//GET routes
router.get('/', (req, res) => {
  res.render('voting')
})
router.get("/admin", (req, res) => {
    res.render("Admin")
})

router.get('/dashboard', ensureAuthenticated,  async (req, res) => {
  let Nominees = await prisma.nominee.findMany();
  res.render("dashBoard", {
    Nominees,
    posts
  });
});

router.get('/voting', (req, res) => {
  count = 0
  res.render('voting')
})

router.get('/votingPosts', ensureAuthenticated, async (req, res) => {
  let nominees = await prisma.nominee.findMany({
    where: {
      post: posts[count]
    }
  })
  res.render('chairman', {
    Nominees: nominees,
    post: posts[count],
    nextPost: posts[count + 1]
  })
  increaseCount()
})

router.get('/votingPosts/:nextPost/:id', ensureAuthenticated, async (req, res) => {
  let nominee = await prisma.nominee.findUnique({
    where: {
      id: req.params.id
    }
  })
  let vote = nominee.votes + 1
  await prisma.nominee.update({
    where: {
      id: req.params.id
    },
    data: {
      votes: vote
    }
  })
  let nominees = await prisma.nominee.findMany({
    where: {
      post: posts[count],
    },
  });

  let newCount = count + 1
  if (newCount < posts.length) {
    res.render("posts", {
      Nominees: nominees,
      post: posts[count],
      nextPost: posts[newCount],
    });
  }
  else {
    res.render("lastVote", {
      Nominees: nominees,
      post: posts[count]
    });
  }
  
  increaseCount()
})

router.get('/votingPosts/:id', ensureAuthenticated, async (req, res) => {
  let nominee = await prisma.nominee.findUnique({
    where: {
      id: req.params.id,
    },
  });
  let vote = nominee.votes + 1;
  await prisma.nominee.update({
    where: {
      id: req.params.id
    },
    data: {
      votes: vote
    }
  })

  res.redirect('/voting')
})

//election results
router.get('/Results', ensureAuthenticated, async (req, res) => {
  Results = []
  let Nominees = await prisma.nominee.findMany()
  for (let i = 0; i < posts.length; i++) {
    Results[i] = {}
    Results[i].Category = posts[i]
    Results[i].Nominees = []
    Nominees.forEach(nominee => {
      if (nominee.post == posts[i]) {
        Results[i]["Nominees"].push(nominee)
      }
      })
  }
  res.render('results', {
    Results
  });
})

// get coupons
router.get("/coupons", ensureAuthenticated, async (req, res) => {
  let coupons = await prisma.coupons.findMany();
  res.render('coupon', {
    coupons
  })
})

//admin logout
router.get("/Logout", ensureAuthenticated, (req, res) => {
  localStorage.clear();
  res.redirect("/admin");
});

router.get('/getCoupon', async (req, res) => {
  let code = nanoid(10)
  await prisma.coupons.create({
    data: {
      codes: code,
      used: false
    }
  })
  res.redirect('/dashboard')
})

//POST routes
router.post('/admin', (req, res) => {
  try {
    async function adminPost() {
   
      const { Email, password } = req.body;
    
      let user = await prisma.admin.findUnique({
        where: {
          email: Email
        }
      })

      if (!user == null) {
        error.push({
          msg: "Admin not found"
        });
        res.render('Admin', {
          error,
          Email, password
        });
        error = []
      }
      else if (user.password != password) {
        error.push({
          msg: "password is Incorrect"
        });
        res.render('Admin', {
          error,
          Email, password
        });
        error = []
      }
      
      else {
        const token = jwt.sign(
          { user_id: user.id, Email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h"
          }
        );
        localStorage.setItem('Token', token)
        res.redirect("/dashboard");
      }
    }
    adminPost(req, res)
      .catch(err => { throw err })
      .finally(async () => {
        await prisma.$disconnect()
      })
  }
  catch (err) {
    console.log(err)
  }
})

//add admin
router.post("/registerAdmin", (req, res) => {
  try {
    async function addAdminPost() {
      const { Email, password, superPassword } = req.body;

      let user = await prisma.admin.findFirst({
        where: {
          email: Email,
          password: password
        },
      });

      let superAdmin = await prisma.admin.findUnique({
        where: {
          email: "godwillonyewuchii@gmail.com"
        }
      })

      if (user != null) {
        error.push({
          msg: "Admin already exists found",
        })
        
      } else if (superAdmin.password != superPassword) {
        error.push({ msg: "admin password Incorrect" })
      }
      else {
        await prisma.admin.create({
          data: {
            email: Email,
            password: password,
            id: uuidv4()
          }
        })
      }
    }
    addAdminPost(req, res)
      .catch((err) => {
        throw err;
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (err) {
    console.log(err);
  }
  res.redirect('/dashboard')
});

router.post("/add", upload.single('avatar'), (req, res) => {
  async function adminPost() {
    let image = `${req.file.filename}`
    const { Name, Post } = req.body;
    let checkNominee = await prisma.nominee.findFirst({
      where: {
        name : Name,
        post : Post
      }
    })
    if (checkNominee) {
      console.log("nominee exists")
      error.push({ msg: "Nominee already exists" })
      // popupS.window("Nominee already exists");
    }
    else{
      await prisma.nominee.create({
        data: {
          name: Name,
          post: Post,
          image: image,
          id: uuidv4(),
          votes: 0
        },
      });
    }
  }
  
  adminPost(req, res)
    .catch((err) => {
      throw err;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  res.redirect("/dashboard");
});

router.post('/update', (req, res) => {
  async function updatePost() {
    const { currentName, newName, currentPost, newPost } = req.body;
     await prisma.nominee.updateMany({
        where: {
          name: currentName,
          post : currentPost
      },
      data: {
         name: newName,
        post: newPost
      }
    });
  }
  console.log(req.body)

  updatePost(req, res)
    .catch((err) => {
    throw err
    })
  .finally( async () => await prisma.$disconnect())
  res.redirect("/dashboard");
});

router.post('/delete', (req, res) => {
  async function deletePost() {
    const { Name, Post } = req.body;
    let nominee = await prisma.nominee.findFirst({
      where: {
        name: Name,
        post: Post,
      },
    });
    try {
      fs.unlink(`./public/${nominee.image}`, (err) => {
        if (err) throw err;
        console.log();
      })
    }
    catch (err) {
      console.log(err)
    }
    await prisma.nominee.deleteMany({
      where: {
        name: Name,
        post: Post
      }
    })
  }

  deletePost(req, res)
    .catch((err) => {
      throw err;
    })
    .finally(async () => await prisma.$disconnect());

  res.redirect('/dashboard')
});

router.post("/deleteAll",  (req, res) => {
  console.log(req.body)
  async function deleteAll() {
    const { Password } = req.body;
    let admin = await prisma.admin.findFirst({
      where:
      {
        password: Password
      }
    })
    let Nominees = await prisma.nominee.findMany();
    console.log(Nominees)
    Nominees.forEach(nominee => {
      fs.unlink(`./public/${nominee.image}`, (err) => {
        if (err) throw err;
        console.log()
      })
    })
    if (admin) {
      await prisma.nominee.deleteMany({})
    }
  }

  deleteAll(req, res)
    .catch((err) => {
      throw err;
    })
    .finally(async () => await prisma.$disconnect());

    res.redirect("/dashboard");    
});

router.post('/checkCoupon', ensureAuthenticated, async (req, res) => {
  let success = []
  let error = []
  const { code } = req.body;
  let recievedCode = await prisma.coupons.findUnique({
    where: {
      codes: code
    }
  });

  if (!recievedCode) {

    error.push({ msg: "Invalid Code" });

    res.render("voting", {
      error
    });
  }
  else if (recievedCode.used == true) {
    error.push({ msg: "Code has been used" });

    res.render("voting", {
      error,
    });
  }
  else if (recievedCode.used == false) {
    await prisma.coupons.update({
      where: {
        codes: code,
      },
      data: {
        used: true
      }
    })
    res.redirect('/votingPosts')
  }

})
module.exports = router;