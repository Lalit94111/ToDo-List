const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// let items=["Watch Movies","Watch Cricket","Play Cricket"];
// let works=["Sleeping"];

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-lalit:9411@cluster0.kp3xa.mongodb.net/todolistDB");

const itemschema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemschema);

const item1 = new Item({
  name: "Welcome to your TODO List"
});

const item2 = new Item({
  name: "Press + to add items"
});

const item3 = new Item({
  name: "Press <-- to Delete an item"
});

const initialitems = [item1, item2, item3];

app.get("/", function(req, res) {
  // var date = new Date();
  // var options = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // }
  // var day = date.toLocaleDateString("en-US", options);
  Item.find(function(err, item) {
    if (item.length == 0) {
      Item.insertMany(initialitems, function(e) {});
    }
    res.render("lists", {
      Today_day: "Today",
      items: item
    });
  });


});

app.post("/", function(req, res) {
  let list = req.body.list;
  let task = req.body.task;
  const item = new Item({
    name: task
  });

  // var date = new Date();
  // var options = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // }
  // var day = date.toLocaleDateString("en-US", options);

  if (list == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: list
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + list);
    });
  }
});

app.post("/delete", function(req, res) {
  const Id = req.body.checkbox;
  const listName = req.body.list;

  if (listName === "Today") {
    Item.findByIdAndRemove(Id, function(err) {
      if (!err) {
        console.log("Successfully Deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: Id
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemschema]
});

const List = mongoose.model("List", listSchema);

app.get("/:path", function(req, res) {
  const newListname = _.capitalize(req.params.path);

  List.findOne({
    name: newListname
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const newList = new List({
          name: newListname,
          items: initialitems
        });
        newList.save();
        res.redirect("/" + newListname);
      } else {
        // Show existing list
        res.render("lists", {
          Today_day: foundList.name,
          items: foundList.items
        });
      }
    }
  });
})

app.listen(process.env.PORT || 3000, function(req, res) {
  console.log("server has started at port 3000");
});
