angular.module('todoListApp')
.directive('todos', function(){
    return {
        templateUrl: 'templates/todos.html',
        controller: 'mainCtrl', //makes it so we dont have to define ng-controller in the todos.html (e.g. <div ng-controller='mainCtrl' class="list">)
        replace: true //hides the custom todo tags in the html <todo>...</todo>
    }
});