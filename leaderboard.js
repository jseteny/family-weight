// Set up a collection to contain familyMember information. On the server,
// it is backed by a MongoDB collection named "familyMembers".

FamilyMembers = new Mongo.Collection("familyMembers");

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    familyMembers: function () {
      return FamilyMembers.find({}, { sort: { weight: -1, name: 1 } });
    },
    selectedName: function () {
      var familyMember = FamilyMembers.findOne(Session.get("selectedFamilyMember"));
      return familyMember && familyMember.name;
    }
  });

  Template.leaderboard.events({
    'click .minus1': function () {
      FamilyMembers.update(Session.get("selectedFamilyMember"), {$inc: {weight: -1}});
    },
    'click .minus5': function () {
      FamilyMembers.update(Session.get("selectedFamilyMember"), {$inc: {weight: -5}});
    },
    'click .plus5': function () {
      FamilyMembers.update(Session.get("selectedFamilyMember"), {$inc: {weight: 5}});
    },
    'click .plus1': function () {
      FamilyMembers.update(Session.get("selectedFamilyMember"), {$inc: {weight: 1}});
    }
  });

  Template.familyMember.helpers({
    selected: function () {
      return Session.equals("selectedFamilyMember", this._id) ? "selected" : '';
    }
  });

  Template.familyMember.events({
    'click': function () {
      Session.set("selectedFamilyMember", this._id);
    }
  });
}

// On server startup, create some familyMembers if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (FamilyMembers.find().count() === 0) {
      var names = ["Jancsi", "Erika", "Matyi",
                   "Panni", "Zsuzsi"];
      _.each(names, function (name) {
        FamilyMembers.insert({
          name: name,
          weight: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });
}
