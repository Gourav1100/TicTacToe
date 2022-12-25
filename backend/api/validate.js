const URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@notepad.ugmhfkn.mongodb.net/?retryWrites=true&w=majority`;
const Mongodb = require("mongodb");
const client = new Mongodb.MongoClient(URI);

const requestHandler = async (req, res) => {
  // set variables
  const database = req.body.database;
  const collection = req.body.collection;
  const query = req.body.query;
  if (
    database == null ||
    database === undefined ||
    collection == null ||
    collection === undefined ||
    query == null ||
    query === undefined
  ) {
    return res.status(200).json({
      success: false,
      message: "invalid request.",
    });
  }
  // connect to database
  try {
    await client.connect();
    const db = client.db(database);
    // check validity for non user requests
    const validity = await db.collection("user").find(query).toArray();
    if (validity.length !== 1) {
      await client.close();
      return res.status(200).json({
        success: false,
        message: "invalid access.",
      });
    }
    await client.close();
    return res.status(200).json({
      success: true,
      token: validity[0]._id.toString(),
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: err.message,
    });
  }
};
exports.execute = requestHandler;
