const hostname = "localhost";
const port = 5000;
const http = require("http");
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://blhayes35:9ORHunbuOayrmGFj@cluster0.vfiki.mongodb.net/";
const dbName = "Library";
const collectionName = "Books";

let client;
let collection; 
// CORS middleware
function corsHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
}

// Utility functions
function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseRequestBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => callback(JSON.parse(body || "{}")));
}

//Connection to MongoDB
async function initMongoClient(){
    try{
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection(collectionName);
    } catch(error){
        console.log("Failed to connect to MongoDb:", error);
        process.exit(1);
    }
}

// Request handler
async function handleRequest(req, res) {
  if (corsHandler(req, res)) return;

  const urlWithoutQuery = req.url.split("?")[0];
  const urlParts =  urlWithoutQuery.split("/");
  const endpoint = urlParts[1];
  const id = urlParts[2];
  const queryParams = new URLSearchParams(req.url.split("?")[1]);

  // Handle each endpoint and method
  try{
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
  
  if (endpoint === "books") {
    switch (req.method) {
      case "GET":
        if (queryParams.get("query")) {
          // Get the search query parameter
          const query = queryParams.get("query");
      
          // Find books that match the title or author using regex (case insensitive)
          const books = await collection
            .find({
              $or: [
                { title: { $regex: query, $options: "i" } },  // Case-insensitive search for title
                { author: { $regex: query, $options: "i" } }  // Case-insensitive search for author
              ]
            })
            .project({ id: 1, title: 1, author: 1, avail: 1 })  // Only return id, title, author, avail
            .toArray();
      
          // Send the filtered list of books as the response
          sendResponse(res, 200, books);
        } else {
          // If no search query, return all books (you can customize this if needed)
          const books = await collection.find({}).project({ id: 1, title: 1, author: 1, publisher: 1, isbn: 1, avail: 1, who : 1, due: 1}).toArray();
          sendResponse(res, 200, books);
        }
        break;
        case "POST": // Create a new book
            parseRequestBody(req, async (newBook) => {
                const existingBook = await collection.findOne({ id: newBook.id });
                if (existingBook) {
                    sendResponse(res, 403, { error: "Book already exists" });
                } else {
                    await collection.insertOne(newBook);
                    sendResponse(res, 201, { message: "Book created" });
                }
            });
            break;

            case "PUT":
              parseRequestBody(req, async (updatedData) => {
                // Remove _id field if it exists in the updated data
                delete updatedData._id;
            
                  // Attempt to update the book in the database
                  const result = await collection.updateOne({ id }, { $set: updatedData });
                  if (result.matchedCount === 0) {
                    sendResponse(res, 404, { error: "Book not found" });
                  } else {
                    sendResponse(res, 200, { message: "Book updated" });
                  }
              });
              break;

      case "DELETE":
        const result = await collection.deleteOne({ id });
        if(result.deletedCount === 0){
            sendResponse(res, 204, null);
        } else{
            sendResponse(res, 200, { message: "Book deleted"});
        }
        break;

      default:
        break;
    }
  } else {
    sendResponse(res, 404, { error: "Not found" });
  }
} catch(error) {
  console.error("Error handling request:", error);
  sendResponse(res, 500, { error: "Internal Server Error"});
} 

}

// Start the server
http.createServer(handleRequest).listen(port, hostname, async () => {
    await initMongoClient();
    console.log(`Server running at http://${hostname}:${port}/`);
});

process.on("SIGINT", async() => {
    consle.log("Closing MongoDB connection...");
    if(client) await client.close();
    console.log("MongoDB connection closed. Exiting.");
    process.exit(0);
});