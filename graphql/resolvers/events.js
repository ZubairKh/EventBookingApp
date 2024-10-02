const Event = require("../../models/event");
const { transformEvent } = require("./merge");
const { dateToString } = require("../../helpers/date");
const User = require("../../models/user");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      creator: req.userId,
    });
    try {
      let createdEvent;
      const result = await event.save();
      const creator = await User.findById(req.userId);
      createdEvent = transformEvent(result);
      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (error) {
      throw error;
    }
  },
};
