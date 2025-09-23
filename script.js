// Assign a Task
function process_function_TaskAssign(task, value, callback = null){
    builder.Widget('task',{data: task.id,unassign:false}).assign(function(){
        if(typeof callback === "function"){
            callback(task, null);
        }
    });
};
function process_meta_TaskAssign(key = null){
    const metadata = {
        label: "Assign a Task",
        description: "Assign a Task to a User",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Activate a task
function process_function_TaskActivate(task, value, callback = null){

    // Check if the task is already active
    if(task.isActive){
        // Execute Callback
        if(typeof callback === "function"){
            callback(task, null);
        }
        return;
    }

    // AJAX Request
    API.endpoint('/tasks/update?id='+task.id).data({isActive: 1}).execute(function(response){
        if(typeof callback === "function"){
            callback(task, response);
        }
    });
}
function process_meta_TaskActivate(key = null){
    const metadata = {
        label: "Activate a Task",
        description: "Activate a Task",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Deactivate a task
function process_function_TaskDeactivate(task, value, callback = null){

    // Check if the task is already inactive
    if(task.isActive <= 0){
        // Execute Callback
        if(typeof callback === "function"){
            callback(task, null);
        }
        return;
    }

    // AJAX Request
    API.endpoint('/tasks/update?id='+task.id).data({isActive: 0}).execute(function(response){
        if(typeof callback === "function"){
            callback(task, response);
        }
    });
}
function process_meta_TaskDeactivate(key = null){
    const metadata = {
        label: "Deactivate a Task",
        description: "Deactivate a Task",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All Tasks
function dashboard_widget_tableTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableTasks('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableTasks(key = null){
    const metadata = {
        label: "All Tasks",
        description: "This is a table that shows all the active tasks.",
        type: "none",
        minSize: 8,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All Tasks Categories
function dashboard_widget_tableTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableTasksCategorized('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableTasksCategorized(key = null){
    const metadata = {
        label: "All Tasks Categorized",
        description: "This is a table that shows all the active tasks of the specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
        minSize: 6,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All Daily Tasks
function dashboard_widget_tableDailyTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableDailyTasks('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableDailyTasks(key = null){
    const metadata = {
        label: "All My Daily Tasks",
        description: "This is a table that shows all the active tasks due today.",
        type: "none",
        minSize: 6,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All Daily Tasks Categorized
function dashboard_widget_tableDailyTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableDailyTasksCategorized('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableDailyTasksCategorized(key = null){
    const metadata = {
        label: "My Daily Tasks Categorized",
        description: "This is a table that shows all the active tasks of the specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
        minSize: 6,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All My Tasks
function dashboard_widget_tableMyTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableMyTasks('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableMyTasks(key = null){
    const metadata = {
        label: "All My Tasks",
        description: "This is a table that shows your active tasks.",
        type: "none",
        minSize: 6,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All My Tasks Categorized
function dashboard_widget_tableMyTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableMyTasksCategorized('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableMyTasksCategorized(key = null){
    const metadata = {
        label: "My Tasks Categorized",
        description: "This is a table that shows your active tasks of the specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
        minSize: 6,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All My Daily Tasks
function dashboard_widget_tableMyDailyTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableMyDailyTasks('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableMyDailyTasks(key = null){
    const metadata = {
        label: "All My Daily Tasks",
        description: "This is a table that shows your active tasks due today.",
        type: "none",
        minSize: 6,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Table Widget for Dashboard - All My Tasks Categorized
function dashboard_widget_tableMyDailyTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasks',
        container,
        {
            title: builder.Locale.get(dashboard_meta_tableMyDailyTasksCategorized('label')),
            autoStart:true,
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_tableMyDailyTasksCategorized(key = null){
    const metadata = {
        label: "My Daily Tasks Categorized",
        description: "This is a table that shows your active tasks of the specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
        minSize: 6,
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Tasks
function dashboard_widget_countTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('Tasks'),
            autoStart:true,
            icon: 'check2-square',
            color: 'primary',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
            ],
        },
    );
    return container;
}
function dashboard_meta_countTasks(key = null){
    const metadata = {
        label: "Count All Tasks",
        description: "This is a count of all the active tasks.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Tasks Categorized
function dashboard_widget_countTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('All '+value+'s'),
            autoStart:true,
            icon: 'check2-square',
            color: 'primary',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_countTasksCategorized(key = null){
    const metadata = {
        label: "Count All Tasks of Category",
        description: "This is a count of all the active tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Daily Tasks
function dashboard_widget_countDailyTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Today's Tasks"),
            autoStart:true,
            icon: 'check2-square',
            color: 'warning',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_countDailyTasks(key = null){
    const metadata = {
        label: "Count All Daily Tasks",
        description: "This is a count of all the daily active tasks.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Daily Tasks Categorized
function dashboard_widget_countDailyTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Today's "+value),
            autoStart:true,
            icon: 'check2-square',
            color: 'warning',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_countDailyTasksCategorized(key = null){
    const metadata = {
        label: "Count of All Daily Tasks of Category",
        description: "This is a count of all the daily active tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Missed Tasks
function dashboard_widget_countMissedTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Missed Tasks"),
            autoStart:true,
            icon: 'check2-square',
            color: 'danger',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMissedTasks(key = null){
    const metadata = {
        label: "Count of All Missed Tasks",
        description: "This is a count of all the active tasks that are overdue.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Missed Tasks Categorized
function dashboard_widget_countMissedTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Missed "+value),
            autoStart:true,
            icon: 'check2-square',
            color: 'danger',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMissedTasksCategorized(key = null){
    const metadata = {
        label: "Count of All Missed Tasks of Category",
        description: "This is a count of all the missed active tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Completed Tasks
function dashboard_widget_countCompletedTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Completed Tasks"),
            autoStart:true,
            icon: 'check2-square',
            color: 'success',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
            ],
        },
    );
    return container;
}
function dashboard_meta_countCompletedTasks(key = null){
    const metadata = {
        label: "Count of All Completed Tasks",
        description: "This is a count of all the active tasks that are completed.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Completed Tasks Categorized
function dashboard_widget_countCompletedTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Completed "+value),
            autoStart:true,
            icon: 'check2-square',
            color: 'success',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_countCompletedTasksCategorized(key = null){
    const metadata = {
        label: "Count of All Completed Tasks of Category",
        description: "This is a count of all the completed tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Completed Tasks Today
function dashboard_widget_countCompletedTasksToday(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Today's Completed Tasks"),
            autoStart:true,
            icon: 'check2-square',
            color: 'success',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_countCompletedTasksToday(key = null){
    const metadata = {
        label: "Count of All Completed Tasks Today",
        description: "This is a count of all the tasks that were completed today.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - All Completed Tasks Today Categorized
function dashboard_widget_countCompletedTasksTodayCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("Today's Completed "+value),
            autoStart:true,
            icon: 'check2-square',
            color: 'primary',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_countCompletedTasksTodayCategorized(key = null){
    const metadata = {
        label: "Count of All Completed Tasks Today of Category",
        description: "This is a count of all the completed tasks of today of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Tasks
function dashboard_widget_countMyTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("My Tasks"),
            autoStart:true,
            icon: 'check2-square',
            color: 'primary',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyTasks(key = null){
    const metadata = {
        label: "Count My Tasks",
        description: "This is a count of my active tasks.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Tasks Categorized
function dashboard_widget_countMyTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("My "+value),
            autoStart:true,
            icon: 'check2-square',
            color: 'primary',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyTasksCategorized(key = null){
    const metadata = {
        label: "Count My Tasks of Category",
        description: "This is a count of my active tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Daily Tasks
function dashboard_widget_countMyDailyTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("My Tasks Today"),
            autoStart:true,
            icon: 'check2-square',
            color: 'warning',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyDailyTasks(key = null){
    const metadata = {
        label: "Count My Daily Tasks",
        description: "This is a count of my daily active tasks.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Daily Tasks Categorized
function dashboard_widget_countMyDailyTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get("My "+value+" Today"),
            autoStart:true,
            icon: 'check2-square',
            color: 'warning',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyDailyTasksCategorized(key = null){
    const metadata = {
        label: "Count of My Daily Tasks of Category",
        description: "This is a count of my daily active tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Missed Tasks
function dashboard_widget_countMyMissedTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('My Missed Tasks'),
            autoStart:true,
            icon: 'check2-square',
            color: 'danger',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyMissedTasks(key = null){
    const metadata = {
        label: "Count of My Missed Tasks",
        description: "This is a count of my active tasks that are overdue.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Missed Tasks Categorized
function dashboard_widget_countMyMissedTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('My Missed '+value),
            autoStart:true,
            icon: 'check2-square',
            color: 'danger',
            conditions:[
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyMissedTasksCategorized(key = null){
    const metadata = {
        label: "Count of My Missed Tasks of Category",
        description: "This is a count of my missed active tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Completed Tasks
function dashboard_widget_countMyCompletedTasks(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('My Completed Tasks'),
            autoStart:true,
            icon: 'check2-square',
            color: 'success',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyCompletedTasks(key = null){
    const metadata = {
        label: "Count of My Completed Tasks",
        description: "This is a count of my active tasks that are completed.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Completed Tasks Categorized
function dashboard_widget_countMyCompletedTasksCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('My Completed '+value),
            autoStart:true,
            icon: 'check2-square',
            color: 'success',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyCompletedTasksCategorized(key = null){
    const metadata = {
        label: "Count of My Completed Tasks of Category",
        description: "This is a count of my completed tasks of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Completed Tasks Today
function dashboard_widget_countMyCompletedTasksToday(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('My Completed Tasks Today'),
            autoStart:true,
            icon: 'check2-square',
            color: 'success',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyCompletedTasksToday(key = null){
    const metadata = {
        label: "Count of My Completed Tasks Today",
        description: "This is a count of my tasks that are completed today.",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Count Widget for Dashboard - My Completed Tasks Today Categorized
function dashboard_widget_countMyCompletedTasksTodayCategorized(value = null){
    var container = $(document.createElement('div'));
    builder.Widget(
        'widgetTasksCounter',
        container,
        {
            title: builder.Locale.get('My Completed '+value+' Today'),
            autoStart:true,
            icon: 'check2-square',
            color: 'success',
            conditions:[
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ],
        },
    );
    return container;
}
function dashboard_meta_countMyCompletedTasksTodayCategorized(key = null){
    const metadata = {
        label: "Count of My Completed Tasks Today of Category",
        description: "This is a count of my completed tasks of today of a specified category.",
        type: "select",
        value: "Callback",
        options: [
            {id: 'Lead', text: 'Lead'},
            {id: 'Client', text: 'Client'},
            {id: 'Call', text: 'Call'},
            {id: 'Callback', text: 'Callback'},
            {id: 'Appointment', text: 'Appointment'},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}
