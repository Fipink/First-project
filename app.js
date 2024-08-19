//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-Firosa:fipink21@cluster0.qc2is.mongodb.net/todolistDB');

}
  

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item", itemsSchema);


const item1 =  new Item ({
  name : "Welcome to your todoList!"
});

const item2 = new Item ({
  name: "To add one click + button."
});
    
const item3 = new Item ({
name : "<-- click here to delete."
});

const defaultitems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
name : String,
items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}).then(foundItems => {

    if(foundItems.length === 0){
      Item.insertMany(defaultitems).then(function () {
        console.log("Successfully saved default items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      
      res.redirect("/");
      }else{ res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req,res){
const customListName = _.capitalize(req.params.customListName);

List.findOne({name:customListName}).then(foundList=>{

if(!foundList){
  //create new list
  const list = new List ({
    name: customListName,
    items: defaultitems
    });
    list.save();
res.redirect("/" + customListName);
}else{
  //show existing list
  res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
}

});

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
 if( listName === "Today"){
  item.save();
  res.redirect("/");
 }else{
  List.findOne({name:listName}).then (foundList => {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" +listName);
  });
 }  
});

app.post("/delete", function(req,res){

const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndDelete(checkedItemId).then(function(err){
    if (err){
      console.log(err);
    }else{
      console.log("succesfully deleted Item from DB");
    }
    });
    
    res.redirect("/");
} else{
  List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkedItemId}}}).then(foundList => {
    
      res.redirect("/" + listName);
   
  });
}



});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
