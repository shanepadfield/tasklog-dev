import React, { Component } from 'react'
import moment from 'moment'

import Arrows from '/imports/ui/components/page/Arrows'
import AddTask from '/imports/ui/components/task/AddTask'
import Task from '/imports/ui/components/task/Task'

import Tasks from '/imports/ui/components/account/Tasks'

class YearlyLog extends Component {
    render() {
        return (
            <div>
                <Arrows title={this.props.match.params.year} />
                <ul className='log'>
                    {moment.months().map((name, number) => (
                        <div key={number}>
                            <p>{name}</p>
                            <AddTask period='month' {...this.props.match.params} month={(number + 1).toString()} />
                            <Tasks {...this.props.match.params} month={(number + 1).toString()}>
                                {tasks => tasks.map(task => (
                                    <Task key={task._id} task={task} tasks={tasks} />
                                ))}
                            </Tasks>
                        </div>
                    ))}
                </ul>
            </div>
        )
    }
}

export default YearlyLog