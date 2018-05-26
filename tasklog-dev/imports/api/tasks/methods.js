import { buildScheduledQuery } from '/imports/utils/time'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tasks } from './tasks'
import { encode } from 'base-64'

Meteor.methods({
    'task.create'(text, scheduled) {
        Tasks.insert({
            userId: Meteor.userId(),
            text: encode(text),
            scheduled,
            status: 'INCOMPLETE',
            due: null,
            completed: null,
            order: -1,
            createdAt: new Date()
        })
        const { day, week, month, year } = scheduled || {}
        const query = buildScheduledQuery(scheduled)
        query.userId = Meteor.userId()
        Tasks.update(query, { $inc: { order: 1 } }, { multi: true })
    },
    'task.delete'(_id) {
        const taskQuery = { _id, userId: Meteor.userId() }
        const { order, scheduled } = Tasks.findOne(taskQuery)
        const updateQuery = {
            ...buildScheduledQuery(scheduled),
            userId: Meteor.userId(),
            order: { $gt: order }
        }
        Tasks.remove(taskQuery)
        Tasks.update(updateQuery, { $inc: { order: -1 } }, { multi: true })
    },
    'task.reorder'(dragId, hoverId) {
        const dragQuery = { _id: dragId, userId: Meteor.userId() }
        const hoverQuery = { _id: hoverId, userId: Meteor.userId() }
        const { order: dragOrder } = Tasks.findOne(dragQuery)
        const { order: hoverOrder } = Tasks.findOne(hoverQuery)
        Tasks.update(dragQuery, { $set: { order: hoverOrder } })
        Tasks.update(hoverQuery, { $set: { order: dragOrder } })
    },
    'task.setText'(_id, text) {
        Tasks.update({ _id, userId: Meteor.userId() }, {
            $set: { text: encode(text) }
        })
    },
    'task.setStatus'(_id, status) {
        Tasks.update({ _id, userId: Meteor.userId() }, {
            $set: { status }
        })
    },
    'task.complete'(_id) {
        Tasks.update({ _id, userId: Meteor.userId() }, {
            $set: {
                completed: new Date(),
                status: 'COMPLETE'
            }
        })
    },
    'task.incomplete'(_id) {
        Tasks.update({ _id, userId: Meteor.userId() }, {
            $set: {
                completed: null,
                status: 'INCOMPLETE'
            }
        })
    },
    'task.toggle'(_id) {
        if (Tasks.findOne({ _id }).status !== 'COMPLETE') {
            Meteor.call('task.complete', _id)
        } else {
            Meteor.call('task.incomplete', _id)
        }
    },
    'task.reschedule'(_id, scheduled) {
        Tasks.update({ _id, userId: Meteor.userId() }, {
            $set: { scheduled, order: -1 }
        })
        const { day, week, month, year } = scheduled || {}
        const query = buildScheduledQuery(scheduled)
        query.userId = Meteor.userId()
        Tasks.update(query, { $inc: { order: 1 } }, { multi: true })
    },
    'task.changeDue'(_id, due) {
        Tasks.update({ _id, userId: Meteor.userId() }, {
            $set: { due }
        })
    }
})