"use strict";

//no need to add [] as the second parameter, since we are not creating a new module here we are simply
//attaching a controller to an existing module.
//injecting a controller, is like saying: "Hey! this is where I want my controller to be used!"
angular.module('todoListApp')
.controller('mainCtrl', function($scope, dataService){
    $scope.addTodo = function(){
        let todo = {name: "New TODO"};
        $scope.todos.unshift(todo);
    }
    $scope.helloConsole = dataService.helloConsole;
    $scope.helloWorld = function(){
        console.log("Hello there! This is the helloWorld controller function, in the mainCtrl!");
    };

    // //Test log function for learning how the ng-change directive works 
    // //ng-repeat="someitem in someiterable"
    // //ng-repeat="todo in todos"
    // $scope.learningNgChange = function(){
    //     console.log('An input changed!');
    // };

    dataService.getTodos(function (response){
        console.log(response.data);
        $scope.todos = response.data;
    });

    //$index is the poisiton of the current todo in the todos array (check line 18 in html)
    $scope.deleteTodo = function(todo, index){ //can also be function(todo, $index)
        dataService.deleteTodo(todo);
        //delete the 1 entry at the current index(the index of the todo you wish to delete)
        $scope.todos.splice(index, 1);
    }

    $scope.saveTodos = function(){
        let filteredTodos = $scope.todos.filter(function(todo){
            if(todo.edited){
                return todo;
            };
        
        })
        dataService.saveTodos(filteredTodos);
    }
})
