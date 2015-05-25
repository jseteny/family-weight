// Set up a collection to contain familyMember information. On the server,
// it is backed by a MongoDB collection named "familyMembers".

FamilyMembers = new Mongo.Collection("familyMembers");

function updateOrCreateWeight(id, value) {
    var old = FamilyMembers.find(id).fetch()[0];
    var newTime = new Date().getTime();
    var seconds = 1000;
    var diff = newTime - old.time;
    if (diff < 20 * seconds) {
        console.log('update');
        FamilyMembers.update(id, {$set: {weight: value}});
        FamilyMembers.update(id, {$set: {time: newTime}});
    } else {
        console.log('insert');
        FamilyMembers.insert({name: old.name, weight: value, time: newTime})
    }
}

if (Meteor.isClient) {
    Template.leaderboard.helpers({
        familyMembers: function () {
            return FamilyMembers.find({});
        },
        selectedName: function () {
            var familyMember = FamilyMembers.findOne(Session.get("selectedFamilyMember"));
            return familyMember && familyMember.name;
        }
    });

    Template.leaderboard.events({

        // update the text of the item on keypress but throttle the event to ensure
        // we don't flood the server with updates (handles the event at most once
        // every 300ms)
        'keyup input[type=text]': _.throttle(function (event) {
            var id = this._id;
            var value = event.target.value;
            updateOrCreateWeight(id, value);
        }, 300)
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
            var names = ["Jancsi"];
            _.each(names, function (name) {
                FamilyMembers.insert({
                    name: name,
                    weight: Math.floor(Random.fraction() * 10) * 5,
                    time: 0
                });
            });
        }
    });
}
