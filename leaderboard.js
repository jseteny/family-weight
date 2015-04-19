// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    players: function () {
      return Players.find({}, { sort: { score: -1, name: 1 } });
    },
    selectedName: function () {
      var player = Players.findOne(Session.get("selectedPlayer"));
      return player && player.name;
    }
  });

  Template.leaderboard.events({
    'click .minus1': function () {
      Players.update(Session.get("selectedPlayer"), {$inc: {score: -1}});
    },
    'click .minus5': function () {
      Players.update(Session.get("selectedPlayer"), {$inc: {score: -5}});
    },
    'click .plus5': function () {
      Players.update(Session.get("selectedPlayer"), {$inc: {score: 5}});
    },
    'click .plus1': function () {
      Players.update(Session.get("selectedPlayer"), {$inc: {score: 1}});
    }
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selectedPlayer", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Jancsi", "Erika", "Matyi",
                   "Panni", "Zsuzsi"];
      _.each(names, function (name) {
        Players.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });
}
