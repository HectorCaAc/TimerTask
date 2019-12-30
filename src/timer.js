import React from 'react';
import './timer.css'

var moment = require('moment')

class Timer extends React.Component{

 constructor(props){
    super()
    this.state={
        timer: new Date(),
        style:'default',
        amountEarn: 0,
        currentTask:{},
        previous: [],
        countDownOn: false,
        showDetails: false,
        adding_task: false,
        showSmallModal: false,
        wrongMessage:""}
    this.addTask = this.addTask.bind(this)
    this.showTodayAcomplish = this.showTodayAcomplish.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.defaultClock = this.defaultClock.bind(this)
    this.counterDown = this.counterDown.bind(this)
    this.showSmallModal = this.showSmallModal.bind(this)
    this.taskWasComplete = this.taskWasComplete.bind(this)
  }

 componentDidMount(){
   let data_json = window.localStorage.getItem("tasks")
   if (!data_json){
     data_json = "{\"data\":[], \"amountEarn\":0}"
     window.localStorage.setItem("tasks",data_json)
   }
   let data = JSON.parse(data_json)
   let currentTask =JSON.parse(window.localStorage.getItem('curentTask'))
   if(currentTask){
     this.setState({countDownOn: true,
                    amountEarn: data.amountEarn, 
                    currentTask: currentTask})
    this.counterDown()
   }else {
     this.interval = setInterval(()=>{this.setState({timer: new Date()})
                                    },1000)
     this.setState({amountEarn: data.amountEarn})}
 }

 addTask(){
   this.setState({adding_task:true})
 }

 showTodayAcomplish(){
   let button = !this.state.showDetails
   this.setState({showDetails:button})
 }

 handleSubmit(event){
   event.preventDefault()
   let form = new FormData(event.target)
   let new_target = moment().add(form.get('timeToFinsih'), 'm')
   let taskValue = form.get('value')
   if (taskValue > -1){
    let newTask = {
      currentTask: form.get('description'),
      value: taskValue,
      timer: new_target.valueOf()}
      window.localStorage.setItem('curentTask', JSON.stringify(newTask))
      this.setState({currentTask: newTask})
      clearInterval(this.interval)
      this.counterDown()
   }else{
      this.setState({wrongMessage:"Value must be greater than 0"})
   }

 }

 defaultClock(addValue){
   let totalCurrent = this.state.amountEarn
   if(addValue){
      let data = JSON.parse(window.localStorage.getItem('curentTask'))
      totalCurrent += parseInt(data.value,10)
   }
   window.localStorage.removeItem('curentTask')
   clearInterval(this.interval)
   this.interval = setInterval(()=>{
                                   let data = {timer: new Date(),
                                              countDownOn: false,
                                              showSmallModal: false,
                                              currentTask:{},
                                              amountEarn:totalCurrent}
                                  this.setState(data)
                                },1000)
 }

 counterDown(){
   this.interval= setInterval(()=>{
                                    let timer = new Date()
                                    let data = JSON.parse(window.localStorage.getItem('curentTask'))
                                    let seconds =(data.timer - timer.getTime() )/1000
                                    if ( seconds > 0 ){
                                      let hoursLeft = Math.floor(seconds/3600)%24
                                      let minutesLeft = Math.floor(seconds/60)
                                      let secondsLeft = Math.floor(seconds)%60
                                      timer.setHours(hoursLeft)
                                      timer.setMinutes(minutesLeft)
                                      timer.setSeconds(secondsLeft)
                                      this.setState({timer: timer,
                                                    countDownOn:true,
                                                    adding_task: false
                                                    })
                                    }else{
                                      this.showSmallModal()
                                    }
                                  }, 1000)
 }

 showSmallModal(){
   clearInterval(this.interval)
   this.setState({showSmallModal:true})
 }

 taskWasComplete(addAmount, addTask){
   let tasksDay = window.localStorage.getItem('tasks')
   if(!tasksDay){
      console.log('The getItem localStorage is not working properly');
     tasksDay = {data:[], amountEarn: addAmount }
   }else{
     tasksDay = JSON.parse(tasksDay)
   }
   if (addTask){
    tasksDay.amountEarn+=addAmount  
   }
   let currentTask = {
                      description: this.state.currentTask,
                      sucess: addTask}
   tasksDay.data.push(currentTask)
   let jsonParser = JSON.stringify(tasksDay)
   window.localStorage.setItem('tasks',jsonParser)
   this.defaultClock(addTask)
 }
 componentWillUmnount(){
  clearInterval(this.interval)
}

  render(){
    return (
      <div className="container">
        {this.state.showSmallModal &&
              <SmallModal name={this.state.currentTask.currentTask}
                          value={this.state.currentTask.value}
                          complete={this.taskWasComplete}/>}
          <Display hour={this.state.timer.getHours()}
                  minute={this.state.timer.getMinutes()}
                  seconds={this.state.timer.getSeconds()}
                  style={this.state.style}
          />
          {this.state.countDownOn &&
            <span className="cancell-button" onClick={()=>this.defaultClock(false)}>
            </span>}
            <div className="menu">
              <h2>Total value of today <span className="badge badge-light">{this.state.amountEarn}</span></h2>
            {!this.state.countDownOn &&
            <div className="btn btn-primary" onClick={()=>this.addTask()}>
              New Activity
              {this.state.adding_task &&
                <form onSubmit={this.handleSubmit}>
                    <div className="error-message">{this.state.wrongMessage}</div>
                    <div className="form-group">
                        <label htmlFor="task">Description of the task</label>
                        <input type="text" className="form-control" id="task" name="description"></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="value">Reward for finish the task</label>
                        <input type="number" className="form-control" id="number" name="value"></input>
                    </div>
                    <div className="form-group">
                      <label htmlFor="timer">How many minutes required to finish the tasks</label>
                      <input type="number" className="form-control" id="timer" name="timeToFinsih"></input>
                    </div>
                        <button className="btn btn-warning">Start Countdownd</button>
                </form>
              }
            </div>
          }
          {this.state.showDetails &&
            <div>
             <ThingsDone/>
              <div className="btn btn-primary"
                onClick={this.showTodayAcomplish}>
                 Hide today Details
               </div>
            </div>}
          {!this.state.showDetails &&
              <div className="btn btn-primary" onClick={this.showTodayAcomplish}>
                  Show Today Success
              </div>
          }
        </div>
    </div>
    )
  }
}

function SmallModal(props){

  return(<div className="small-modal">
          <h3>Was the Activity "{props.name}" complete</h3>
          <h4> This activity will add a value of {props.value} to your current amount</h4>
          <div className ="options">
            <span onClick={()=> props.complete(parseInt(props.value,10), true)}
                  className="btn btn-primary">Yes</span>
                <span onClick={()=> props.complete(parseInt(props.value,10), false)}
              className="btn btn-primary">No</span>
          </div>
  </div>)
}

function Display(props){
  let hour = props.hour.toString()
  let minute = props.minute.toString()
  let second = props.seconds.toString()

  hour = hour.length === 2 ? hour: '0'+hour
  minute = minute.length === 2 ? minute: '0'+minute
  second = second.length === 2 ? second: '0'+second
  return (
    <div className={"display "+props.style}>
      <span>{hour}</span>:
      <span>{minute}</span>:
      <span>{second}</span>
    </div>
  )
}

function ThingsDone(props){
  let previous_data =  window.localStorage.getItem("tasks")
  let previous_object = JSON.parse(previous_data)
  let rows = previous_object.data.map((previous_task, key)=>
                            <tr key={key} className ={previous_task.sucess ? "sucess":"fail"}>
                            <td>{previous_task.description.currentTask}</td>
                            <td>{previous_task.description.timer}</td>
                            <td>{previous_task.description.value}</td>
                            </tr>
  )
  console.log(previous_object.data)
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Desecription</th>
          <th>Date finish </th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {rows}
    </tbody>
    </table>
  )
}

export {Timer}
