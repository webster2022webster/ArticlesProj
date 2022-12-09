const http = require('http'); // The main server package
const fs = require('fs'); // The file system package, used to deal with files
var mysql = require('mysql');
var formidable = require('formidable');
//const express = require('express');
//const app = express();
//app.use(express.static(__dirname+'/'));
//statics files are css,photos etc

// To access the server from the browser use: 127.0.0.1:3000
const hostname = '127.0.0.1'; // The server IP
const port = 3000; // The server port

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'articlenodedb',
    multipleStatements: true
    });

// Creating a server
const server = http.createServer((request, response) => {
  // Getting the requested URL from the browser
  let url = request.url;

  // The routing
  if(url === '/') { // The home page route
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    // Sending an HTML file as a response
    fs.readFile('pages/index.html', null, function (error, data) {
      if (error) {
        response.writeHead(404);
        response.write('Whoops! Page not found!');
      }else {
        response.write(data);
      }
      response.end();
    });
  }
  else if(url ==='/css/Index.css') { // The 'css' page route
    fs.readFile('pages/css/Index.css', null ,function (err, data) {
      if (err) console.log(err);
      response.writeHead(200, {'Content-Type': 'text/css'});
      response.write(data);
      response.end();
    });
    }
    else if(url ==='/css/Login.css') { // The 'css' page route
      fs.readFile('pages/css/Login.css', null ,function (err, data) {
        if (err) console.log(err);
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(data);
        response.end();
      });
      }
    else if(url ==='/images/bg.jpeg') { // The 'css' page route
      fs.readFile('pages/images/bg.jpeg', null ,function (err, data) {
        if (err) console.log(err);
        response.writeHead(200, {'Content-Type': 'image/jpeg'});
        response.write(data);
        response.end();
      });
      }

  else if(url ==='/add') { // The 'about' page route
  response.writeHead(200, {'Content-Type': 'text/html'});
  // Sending an HTML file as a response
  fs.readFile('pages/add_article.html', null, function (error, data) {
    if (error) {
      response.writeHead(404);
      response.write('Whoops! Page not found!');
    }else {
      response.write(data);
    }
    response.end();
  });
  }else if(url === '/add_article'){
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      if(fields.code == '159753')
      {
        let query = "INSERT INTO article (title, authors, summary, link) VALUES (?, ?, ?, ?);";
        let values_to_insert = [
          fields.title,
          fields.authors,
          fields.summary,
          fields.link
        ]
  
        mysqlConnection.query(query, values_to_insert, (err, rows) => {
            if (err) throw err;
        });
      response.statusCode = 302; //Redirecting to articles page
      response.setHeader('Location', '/articles');
      response.end();
      }
      else
      {
        var alert = require('alert');

        alert('You are not authorized!!');
       }
      
    });
  }
else if(url ==='/articles'){
    mysqlConnection.query('SELECT * FROM article', (err, rows, fields) => {
      if (!err){
        let res = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="ISO-8859-1">
        <title>Articles</title>
        <link rel="stylesheet" href="css/Index.css">
        </head>
          <body>
          <div class="active">
          <div class="filler"></div>
              <h1>All articles</h1>
          
            <div><a href ="/add" >Add new article</a>
            <div>
            <p></p>
              <table>
                <tr>
                  <th> Article Title </th>
                 
                </tr>
        `
        for (var i = 0; i < rows.length; i++) {
            res +="<tr><td><a href='/articles/view/" + rows[i].article_id+"'>"
                  + rows[i].title
                  + "</a></td></tr>"
        }
        res += "</div></table></body></html>"
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(res)
      }else {
        console.log(err);
      }
    })
  }
  else if(url.startsWith('/articles/view/')){
    let split_url = url.split("/")
    let a_id = split_url[split_url.length - 1] //getting the article ID to delete
   
    var sql = 'SELECT * FROM article where article_id = ?';
    mysqlConnection.query(sql, [a_id], function (err, result) {
       
      if (!err){
        let res = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="ISO-8859-1">
        <title>Articles</title>
        <link rel="stylesheet" href="../../css/Index.css">
        </head>
          <body>
          <div class="active">
          <div class="filler"></div>
              <h1>Article Information</h1>
          
              <div class="bigcard">
              <div class="bigcard1">
                  <div>
                      <h3>Title</h3>`
                res+="<h6>"+result[0]?.title +"</h6>"
                 +" </div>"
                 +"<div>"
                      +"<h3>Authors</h3>"
                     +"<h6>"+result[0]?.authors +"</h6>"
                 +"</div>"
                 +"<div>"
                    +  "<h3>Summary</h3>"
                    + "<h6>"+result[0]?.summary +"</h6>"
                 +"</div>"
                + "<div>"
                     + "<h3>Link</h3>"
                     +"<h6>"
                     if(result[0]?.link !=""){res+=result[0]?.link;}else{res+="No link available"} +"</h6>"
                 res+="</div><div><form action='/delete_article' method='post' ><div><h4>Authontication Code</h4><input type='text' id='code' name='code'  required/><input type='hidden' value='"+result[0]?.article_id+"' name='article_id' id ='article_id'/></div>"
              +"<p></p>"
              +"<input type='submit' value='Delete' /> </form>"
        +"<a href='/articles/edit/"
                  + result[0]?.article_id
                  + "'>Edit</a>"
       
       
        
        res += "</div></div></div></body></html>"
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(res)
      }else {
        console.log(err);
      }
    })
  }
  else if(url.startsWith('/articles/edit/')){
    let split_url = url.split("/")
    let a_id = split_url[split_url.length - 1] //getting the article ID to delete
   
    var sql = 'SELECT * FROM article where article_id = ?';
    mysqlConnection.query(sql, [a_id], function (err, result) {
       
      if (!err){
        let res = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="ISO-8859-1">
        <title>Articles</title>
        <link rel="stylesheet" href="../../css/Index.css">
        </head>
          <body>
          <div class="active">
          <div class="filler"></div>
              <h1>Article Information</h1>
          
              <div class="bigcard">
              <div class="bigcard1">
                  <div>
                  <form action='/edit_article' method='post'>
                  <h3>Title</h3>`
                res+="<input type='text' id='new_title' name='new_title' value='"+result[0]?.title+"'/>"
                 +" </div>"
                 +"<div>"
                      +"<h3>Authors</h3>"
                      +"<input type='text' id='new_author' name='new_author' value='"+result[0]?.authors+"'/>"
                 +"</div>"
                 +"<div>"
                    +  "<h3>Summary</h3>"
                    +"<input type='text' id='new_summary' name='new_summary' value='"+result[0]?.summary+"'/>"
                 +"</div>"
                + "<div>"
                     + "<h3>Link</h3>"
                     +"<input type='text' id='new_link' name='new_link' value='"+result[0]?.link+"'/>"

                     res+="</div><div> <div><h4>Authontication Code</h4><input type='text' id='code' name='code'  required/><input type='hidden' value='"+result[0]?.article_id+"' name='article_id' id ='article_id'/></div>"
                        +"<p></p>"
              +"<input type='submit' value='Update' /> </form>"

        res += "</div></div></div></body></html>"
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(res)
      }else {
        console.log(err);
      }
    })
  }
  else if(url ==='/delete_article'){
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      if(fields.code == '159753')
      {
        let query = "DELETE FROM article where article_id = ?;";
        let values_to_insert = [
          fields.article_id
        ]
  
        mysqlConnection.query(query, values_to_insert, (err, rows) => {
            if (err) throw err;
        });
      response.statusCode = 302; //Redirecting the user to the users page
      response.setHeader('Location', '/articles');
      response.end();
      }
      else
      {
        var alert = require('alert');

        alert('You are not authorized!!');
        }
      
    });
    
    
  }
  //edit
  else if(url ==='/edit_article'){
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      if(fields.code == '159753')
      {
        let query = " UPDATE article SET `title` = '"+fields.new_title+"', `authors` = '"+fields.new_author+"', `summary` = '"+fields.new_summary+"',`link` = '"+fields.new_link+"' WHERE `article_id` = '"+fields.article_id+"';";
        
        mysqlConnection.query(query, (err, rows, fields) => {

            if (err) throw err;
        });
      response.statusCode = 302; //Redirecting the user to the users page
      response.setHeader('Location', '/articles');
      response.end();
      }
      else
      {
        var alert = require('alert');

        alert('You are not authorized!!');
        }
      
    });
    
    
  }else { // If the user entered a page that doesn't exist, send the 'page not found' response
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/html');
    response.end(`<div style="color: red;">Whoops! Page not found!</div>
                  <div><a href="/">Return home</a></div>`);
  }
});

// Running the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
