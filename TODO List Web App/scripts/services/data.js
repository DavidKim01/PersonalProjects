'use strict';
angular.module('todoListApp')
.service('dataService', function($http){ //$http is the http provider
    //using "this" to attach a method to the service
    this.helloConsole = function(){
        console.log('This is the hello console service!');
    }

    //to do a GET request on the mock API for the todos.json at ./mock/todos.json
    //first parameter is a url chained with a then method to execute code after a response has been
    //received from the server. The parameter of then is callback that is executed
    //after a successful response receival
    this.getTodos = function(callback){
        $http.get('/mock/todos.json').then(callback);
    }

    //param todo: the todo to be deleted.
    this.deleteTodo = function(todo){
        console.log("The " + todo.name + " todo has been deleted!");
        //simulates a communication with the REST API to delete the todo from the db
    }

    //param todo: the todo to be saved.
    this.saveTodos = function(todos){
        console.log(todos.length + " todos has been saved!");

    }
})
.controller('coolCtrl', function($scope){
    $scope.whoAmI = function(){
        console.log("Hello there, this is the coolCtrl function!");
    };
    //this helloWorld function, even though its named the same, will be called instead because 
    //the scope is attached to the coolCtrl. Due to prototypical inheritance it will only 
    //inherit the parent functions if they are not already defined for the inner controller.
    //prototypical inheritance only goes in one direction, from parent to children.
    //NOTE: sibling controllers will not have access to each other's scopes. Sibling scopes are completely isolated.
    $scope.helloWorld = function(){
        console.log("This is not the main ctrl!");
    }
})

.controller('imASiblingToMain', function($scope){
    $scope.foobar = 1234;

    //do other cool stuff!
});