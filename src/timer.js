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
        currentTask:'',
        previous: [],
        countDownOn: false,
        showDetails: false,
        adding_task: false,
        showSmallModal: false}
    this.addTask = this.addTask.bind(this)
    this.showTodayAcomplish = this.showTodayAcomplish.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.defaultClock = this.defaultClock.bind(this)
    this.counterDown = this.counterDown.bind(this)
    this.showSmallModal = this.showSmallModal.bind(this)
    this.taskWasComplete = this.taskWasComplete.bind(this)
  }

 componentDidMount(){
   let data = window.localStorage.getItem('tasks') ? window.localStorage.getItem('tasks'): window.localStorage.setItem('tasks', {data:[]})
   data = data.data
   let currentTask =JSON.parse(window.localStorage.getItem('curentTask'))
   if(currentTask){
     this.setState({countDownOn: true,
                    amountEarn: data})
    this.counterDown()
   }else {
     this.interval = setInterval(()=>{this.setState({timer: new Date()})
                                    },1000)
     this.setState({amountEarn: data})}
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
   let newTask = {
              currentTask: form.get('description'),
              value: form.get('value'),
              timer: new_target.valueOf()}
   window.localStorage.setItem('curentTask', JSON.stringify(newTask))
   clearInterval(this.interval)
   this.counterDown()
 }

 defaultClock(){
   window.localStorage.removeItem('curentTask')
   clearInterval(this.interval)
   this.interval = setInterval(()=>{
                                   let data = {timer: new Date(),
                                              countDownOn: false,
                                              showSmallModal: false}
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
                                      console.log(hoursLeft)
                                      timer.setHours(hoursLeft)
                                      timer.setMinutes(minutesLeft)
                                      timer.setSeconds(secondsLeft)
                                      console.log(timer)
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

 taskWasComplete(addAmount){
   let tasksDay = window.localStorage.getItem('tasks').data
   if(!tasksDay){
     console.log('The getItem localStorage is not working properly');
     tasksDay = {data:[] }
   }
   let currentTask = {
                      description: this.state.currentTask,
                      value : this.state.amountEarn,
                      sucess: addAmount}
   tasksDay.data.push(currentTask)
   window.localStorage.setItem('tasks',currentTask)
   this.defaultClock()
 }

 componentWillUmnount(){
  clearInterval(this.interval)
}

  render(){
    return (
      <div className="container">
        {this.state.showSmallModal &&
              <SmallModal name={this.state.currentTask}
                          value={this.state.amountEarn}
                          complete={this.taskWasComplete}/>}
          <Display hour={this.state.timer.getHours()}
                  minute={this.state.timer.getMinutes()}
                  seconds={this.state.timer.getSeconds()}
                  style={this.state.style}
          />
        <div className="menu">
            <h2>Total value of today <span className="badge badge-light">{this.state.amountEarn}</span></h2>
            {!this.state.countDownOn &&
            <div className="btn btn-primary" onClick={()=>this.addTask()}>
              New Activity
              {this.state.adding_task &&
                <form onSubmit={this.handleSubmit}>
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

  const test = () =>{
    console.log("This has a better feel because the variable name has some key word to know is a fuction");
  }

  return(<div className="small-modal">
          <h3>Was the Activity {props.name} complete</h3>
          <h4> This activity will add a value of {props.value} to your current amount</h4>
          <div className ="options">
            <span onClick={()=> props.complete(true)}
                  className="btn btn-primary">Yes</span>
                <span onClick={()=> props.complete(false)}
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

  let number_elments = [
                        {description: "work for 30 minutes", value : 100, sucess: false},
                        {description: "work for 30 minutes", value : 100, sucess: true},
                        {description: "work for 30 minutes", value : 100, sucess: false}
                      ]
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Desecription</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
      { number_elments.map((element, key)=><tr key={key} className={element.sucess ? "sucess" : "fail"}  >
                                <td>{element.description}</td>
                                <td>{element.value}</td>
    </tr>)}
    </tbody>
    </table>
  )
}

export {Timer}
