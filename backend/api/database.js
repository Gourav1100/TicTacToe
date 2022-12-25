const URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@notepad.ugmhfkn.mongodb.net/?retryWrites=true&w=majority`;
const Mongodb = require("mongodb");
const client = new Mongodb.MongoClient(URI);

const get = async (req) => {
  // set variables
  const database = req.query.database || req.body.database;
  const collection = req.query.collection || req.body.collection;
  const token = req.query.token || req.body.token;
  const include = req.query.include || req.body.include;
  if (
    database == null ||
    database === undefined ||
    collection == null ||
    collection === undefined ||
    token == null ||
    token === undefined ||
    include == null ||
    include === undefined
  ) {
    return {
      success: false,
      message: "invalid request.",
    };
  }
  // connect to database
  try {
    await client.connect();
    const db = client.db(database);
    // check validity for non user requests
    const validity = await db
      .collection("user")
      .find({ _id: Mongodb.ObjectId(token) })
      .toArray();
    if (validity.length !== 1) {
      await client.close();
      return {
        success: false,
        message: "invalid access.",
      };
    }
    if (collection === "user") {
      const filtered_Result = [];
      validity.map((item) => {
        const filtered = {};
        include.map((filter) => {
          filtered[filter] = item[filter];
          return true;
        });
        filtered_Result.push(filtered);
        return true;
      });
      return {
        success: true,
        data: filtered_Result,
      };
    }
    // if a valid user then search for data
    const result = [];
    await (
      await db.collection(collection).find().toArray()
    ).map((item) => {
      for (var i = 0; i < item.users.length; i++) {
        if (item.users[i] === validity[0].email) {
          result.push(item);
          break;
        }
      }
      return true;
    });
    await client.close();
    const filtered_Result = [];
    result.map((item) => {
      const filtered = {};
      include.map((filter) => {
        filtered[filter] = item[filter];
        return true;
      });
      filtered_Result.push(filtered);
      return true;
    });

    return {
      success: true,
      data: filtered_Result,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};
const add = async (req) => {
  // set variables
  const query = req.body.query;
  const database = req.body.database;
  const collection = req.body.collection;
  const token = req.body.token;
  query["timestamp"] = Date.now();
  if (
    query == null ||
    query === undefined ||
    database == null ||
    database === undefined ||
    collection == null ||
    collection === undefined
  ) {
    return {
      success: false,
      message: "invalid Data.",
    };
  }
  if ((token == null || token === undefined) && collection !== "user") {
    return {
      success: false,
      message: "invalid Token.",
    };
  }
  // connect to database
  try {
    await client.connect();
    const db = client.db(database);
    let append = "";
    // check validity for non user requests
    if (collection !== "user") {
      const validity = await db
        .collection("user")
        .find({ _id: Mongodb.ObjectId(token) })
        .toArray();
      if (validity.length !== 1) {
        await client.close();
        return {
          success: false,
          message: "invalid access.",
        };
      }
    }
    if (collection === "user") {
      // check if requested entry is already present or not
      if (
        query.email == null ||
        query.email === undefined ||
        query.username == null ||
        query.username === undefined
      ) {
        client.close();
        return {
          success: false,
          message: "invalid email address or username.",
        };
      }
      const result = await db
        .collection(collection)
        .find({
          $or: [{ email: query.email }, { username: query.username }],
        })
        .toArray();
      if (result.length !== 0) {
        return {
          success: false,
          message: "entry already exists.",
        };
      }
      await db.collection(collection).insertOne(query);
    } else if (collection === "games") {
      // if entry does not exist check for validity of user 2
      const result = await db
        .collection("user")
        .find({
          _id: Mongodb.ObjectId(token),
        })
        .toArray();
      const response = await db
        .collection("user")
        .find({
          email: query.email,
        })
        .toArray();
      if (response.length !== 1) {
        await client.close();
        return {
          success: false,
          message: "invalid email address.",
        };
      }
      if (result[0].email === response[0].email) {
        await client.close();
        return {
          success: false,
          message: "you cannot start a game with yourself.",
        };
      }
      const validGame = await db
        .collection(collection)
        .find({
          $or: [
            { users: [result[0].email, response[0].email] },
            { users: [response[0].email, result[0].email] },
          ],
        })
        .toArray();
      if (validGame.length !== 0) {
        await client.close();
        return {
          success: false,
          message: "game already exists.",
        };
      }
      let newGame = {
        timestamp: Date.now(),
        moves: result[0].email,
        state: ["", "", "", "", "", "", "", "", ""],
        finished: "",
        users: [result[0].email, response[0].email],
        usersinfo: [
          [result[0].name, result[0].username],
          [response[0].name, response[0].username],
        ],
      };
      await db.collection(collection).insertOne(newGame);
      append = await db.collection(collection).find(newGame).toArray();
      append = append[0]._id;
      newGame["_id"] = append;
      append = newGame;
    }
    await client.close();
    return {
      success: true,
      message: "record added successfully.",
      data: append,
    };
  } catch (err) {
    console.log(err.message);
    return {
      success: false,
      message: "server-side error.",
    };
  }
};

async function requestHandler(req, res) {
  var response;
  switch (req.method) {
    case "GET":
      response = await get(req);
      break;
    case "POST":
      response = await add(req);
      break;
    default:
      response = {
        success: false,
        message: "Invalid request type !!!",
      };
      break;
  }
  return res.status(200).json(response);
}
exports.execute = requestHandler;
