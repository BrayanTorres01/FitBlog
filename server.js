// Get the module express
const express = require("express");
const expressHandlebars = require("express-handlebars");
const session = require("express-session");
const canvas = require("canvas");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Configuration and Setup
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Get access to all the methods of express
const app = express();
const PORT = 3000;

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Handlebars Helpers

    Handlebars helpers are custom functions that can be used within the templates 
    to perform specific tasks. They enhance the functionality of templates and 
    help simplify data manipulation directly within the view files.

    In this project, two helpers are provided:
    
    1. toLowerCase:
       - Converts a given string to lowercase.
       - Usage example: {{toLowerCase 'SAMPLE STRING'}} -> 'sample string'

    2. ifCond:
       - Compares two values for equality and returns a block of content based on 
         the comparison result.
       - Usage example: 
            {{#ifCond value1 value2}}
                <!-- Content if value1 equals value2 -->
            {{else}}
                <!-- Content if value1 does not equal value2 -->
            {{/ifCond}}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

// Set up Handlebars view engine with custom helpers
//
app.engine(
  "handlebars",
  expressHandlebars.engine({
    helpers: {
      toLowerCase: function (str) {
        return str.toLowerCase();
      },
      ifCond: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", "./views");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Middleware
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.use(
  session({
    secret: "oneringtorulethemall", // Secret key to sign the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: { secure: false }, // True if using https. Set to false for development without https
  })
);

// Replace any of these variables below with constants for your application. These variables
// should be used in your template files.
//
app.use((req, res, next) => {
  res.locals.appName = "FitBlog";
  res.locals.copyrightYear = 2024;
  res.locals.postNeoType = "Post";
  res.locals.loggedIn = req.session.loggedIn || false;
  res.locals.userId = req.session.userId || "";
  next();
});

app.use(express.static("public")); // Serve static files
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Routes
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Home route: render home view with posts and user
// We pass the posts and user variables into the home
// template
//
app.get("/", (req, res) => {
  const posts = getPosts();
  const user = getCurrentUser(req) || {};
  res.render("home", { posts, user, style: "styles.css" });
});

// Register GET route is used for error response from registration
//
app.get("/register", (req, res) => {
  res.render("loginRegister", {
    regError: req.query.error,
    style: "login.css",
  });
});

// Login route GET route is used for error response from login
//
app.get("/login", (req, res) => {
  res.render("loginRegister", {
    loginError: req.query.error,
    style: "login.css",
  });
});

// Error route: render error page
//
app.get("/error", (req, res) => {
  res.render("error");
});

// Additional routes that you must implement

app.get("/post/:id", (req, res) => {
  // TODO: Render post detail page
  const postId = req.session.id;
  const post = posts.find((post) => post.id === postId);

  if (post) {
    res.render("postDetail", { post, style: "styles.css" });
  } else {
    console.log("no post")
  }
});
app.post("/posts", (req, res) => {
  // TODO: Add a new post and redirect to home
  const { title, postInfo } = req.body;
  const userId = req.session.userId;
  const user = findUserById(userId);
  if (!userId || !user) {
    return res.redirect("/login");
  }
  addPost(title, postInfo, user);
  res.redirect("/");
});
app.post("/like/:id", (req, res) => {
  // TODO: Update post likes
});
app.get("/profile", isAuthenticated, (req, res) => {
  // TODO: Render profile page
    renderProfile(req,res);
});
app.get("/avatar/:username", (req, res) => {
  // TODO: Serve the avatar image for the user
});
app.post("/register", (req, res) => {
  // TODO: Register a new user
  // When for register button is clicked call this func
  registerUser(req, res);
});

// app.post('/register, registerUser')

app.post("/login", (req, res) => {
  // When login button is clicked call this func
  loginUser(req, res);
});

app.get("/logout", (req, res) => {
  // TODO: Logout the user
  logoutUser(req, res);
});
app.post("/delete/:id", isAuthenticated, (req, res) => {
  // TODO: Delete a post if the current user is the owner
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Server Activation
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Support Functions and Variables
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Example data for posts and users
let posts = [
  {
    id: 1,
    title: "Sample Post",
    content: "This is a sample post written by me .",
    username: "SampleUser",
    timestamp: "2024-01-01 10:00",
    likes: 0,
  },
  {
    id: 2,
    title: "Another Post",
    content: "This is another sample post.",
    username: "AnotherUser",
    timestamp: "2024-01-02 12:00",
    likes: 0,
  },
];
let users = [
  {
    id: 1,
    username: "SampleUser",
    avatar_url: undefined,
    memberSince: "2024-01-01 08:00",
  },
  {
    id: 2,
    username: "AnotherUser",
    avatar_url: undefined,
    memberSince: "2024-01-02 09:00",
  },
];

// Function to find a user by username
function findUserByUsername(username) {
  // TODO: Return user object if found, otherwise return undefined
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return existingUser;
  } else {
    return undefined;
  }
}

// Function to find a user by user ID
function findUserById(userId) {
  // TODO: Return user object if found, otherwise return undefined
  // const existingID =  users.find(user => user.id === userId);
  // if(existingUser){
  //     return existingUser;
  // }
  // else{
  //     return undefined
  // }
  return users.find((user) => user.id === userId);
}

// Function to add a new user
function addUser(username) {
  // TODO: Create a new user object and add to users array
  // We need to access the last id
  let idNum = users[users.length - 1].id;
  // New object
  let newUser = {
    id: ++idNum,
    username: username,
    avatar_url: undefined,
    memberSince: new Date().toLocaleString(),
  };
  // Adds the user to the end of the users array
  users.push(newUser);
  console.log(users);
}

// Middleware to check if user is authenticated
// If req.session.userId exist it calls the next func for the next authentication
function isAuthenticated(req, res, next) {
  console.log(req.session.userId);
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Function to register a user
function registerUser(req, res) {
  // TODO: Register a new user and redirect appropriately
  // Get the user name that was typed by req.body
  const username = req.body.username;
  // If user name already exist dont let user register
  const existingUser = findUserByUsername(username);
  if (existingUser) {
    // Username already exists, redirect back to registration page with an error message
    return res.redirect("/register?error=Username%20already%20exists");
  }
  // Let them register and send call func adduser to add him into the array of Users
  else {
    console.log("Got username " + username);
    addUser(username);
    console.log("You have succesfully registered");
  }
}

// Function to login a user
function loginUser(req, res) {
  // TODO: Login a user and redirect appropriately
  // Get the user name that was typed by req.body
  const username = req.body.username;
  const existingUser = findUserByUsername(username);
  // Check for existing username
  // const userid = req.session.userId
  // const existingUser = findUserByUsername(userid)
  // If found log in
  if (existingUser) {
    // indcates the user is logged in
    req.session.loggedIn = true;
    // sets userID
    req.session.userId = existingUser.id;
    console.log(existingUser.id);
    // redirects to the main page
    res.redirect("/");
    console.log("logging in");
  }
  // User not in the system
  else {
    console.log("no user found");
  }
}

// Function to logout a user
function logoutUser(req, res) {
  // TODO: Destroy session and redirect appropriately
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session: ", err);
      res.redirect("/error");
    } else {
      res.redirect("/");
      console.log("logout!");
    }
  });
}

// Function to render the profile page
function renderProfile(req, res) {
  // TODO: Fetch user posts and render the profile page
   const currentUser = getCurrentUser(req);

   if (currentUser) {
    // Fetch user posts filters post to only currentuser
    const userPosts = getPosts().filter(
      (post) => post.username === currentUser.username
    );
    // Render the profile page with user information and posts
    res.render("profile", {
      user: currentUser,
      posts: userPosts,
      style: "profile.css",
    });
    console.log("In profile of ", currentUser);
   } else {
    // If the current user is not found, redirect to login page
    res.redirect("/login");
   }
   
}

// Function to update post likes
function updatePostLikes(req, res) {
  // TODO: Increment post likes if conditions are met
}

// Function to handle avatar generation and serving
function handleAvatar(req, res) {
  // TODO: Generate and serve the user's avatar image
}

// Function to get the current user from session
function getCurrentUser(req) {
  // TODO: Return the user object if the session user ID matches
  return users.find((user) => user.id === req.session.userId);
}

// Function to get all posts, sorted by latest first
function getPosts() {
  return posts.slice().reverse();
}

// Function to add a new post
function addPost(title, postInfo, user) {
  // TODO: Create a new post object and add to posts array
   let idNum = posts.length > 0 ? posts[posts.length - 1].id + 1 : 1;
   let newPost = {
    id: idNum,
    title: title,
    content: postInfo,
    username: user.username,
    timestamp: new Date().toLocaleString(),
    likes: 0,
   };
   posts.push(newPost);
   console.log(posts)
   
}

// Function to generate an image avatar
function generateAvatar(letter, width = 100, height = 100) {
  // TODO: Generate an avatar image with a letter
  // Steps:
  // 1. Choose a color scheme based on the letter
  // 2. Create a canvas with the specified width and height
  // 3. Draw the background color
  // 4. Draw the letter in the center
  // 5. Return the avatar as a PNG buffer
}
