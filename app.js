const express = require("express");
const morgan = require("morgan");
const postBank = require("./postBank");
const { default: htmlTemplateTag } = require("html-template-tag");

const app = express();

app.use(morgan("dev"));

app.use(express.static("public"));

app.get("/", (req, res) => {
  //FIRST, GET THE LIST OF POSTS
  const posts = postBank.list();

  //THEN, PREPARE SOME HTML TO SEND AS OUTPUT
  const HTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Wizard News</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="news-list">
      <header><img src="/logo.png"/>Wizard News</header>
      ${posts
        .map(
          (post) => `
        <div class='news-item'>
          <p>
            <span class="news-position">${post.id}. ▲</span>
            <a href="/posts/${post.id}">${post.title}</a>
            <small>(by ${post.name})</small>
          </p>
          <small class="news-info">
            ${post.upvotes} upvotes | ${post.date}
          </small>
        </div>`
        )
        .join("")}
    </div>
  </body>
</html>`;

  //FINALLY, SEND A RESPONSE
  res.send(HTML);
});

app.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  const post = postBank.find(id);
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Wizard News</title>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <div class="news-list">
        <header><img src="/logo.png"/>Wizard News</header>
          <div class='news-item'>
          <p>
          <span class="news-position">${post.id}. ▲</span>
          ${post.title}
          <small>(by ${post.name})</small>
          </p>
          <p class="news-info">${post.content}</small>
          </p>
      </div>
    </body>
  </html>`;

  if (!post.id) {
    // If the post wasn't found, just throw an error
    throw new Error("Not Found");
  } else {
    res.send(html);
  }
});

const { PORT = 1337 } = process.env;

app.use((err, req, res, next) => {
  console.error(err);
  res.status(404);
  res.send({
    name: err.name,
    message: err.message,
    // stack: err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});
