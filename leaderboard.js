// Set up a collection to contain familyMember information. On the server,
// it is backed by a MongoDB collection named "familyMembers".

FamilyMembers = new Mongo.Collection("familyMembers");

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}

function updateOrCreateWeight(id, value) {
    var weights = FamilyMembers.find(id).fetch()[0].weights;
    var old = weights.last();
    var newTime = new Date().getTime();
    var seconds = 1000;
    var diff = newTime - old.time;
    if (diff < 20 * seconds) {
        console.log('update');
        weights.last().weight = value;
        weights.last().time = newTime;
    } else {
        console.log('insert');
        weights.push({weight: value, time: newTime});
    }
    FamilyMembers.update(id, {$set: {weights: weights}});
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
                    weights: [{weight: Math.floor(Random.fraction() * 10) * 5, time: 0}]
                });
            });
        }
    });
}
