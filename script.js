// Register dashboard widgets only if dashboard is defined
if(typeof dashboard !== "undefined"){

    // Register - Task Counter Widget
    // A simple counter widget for the dashboard to count tasks based on conditions
    // by default it counts all tasks, but can be filtered by owner or other conditions
    dashboard.add('counter-tasks', class extends dashboard.Widget {
        _init(){
            this._properties = {
                name: "counter-tasks",
                label: "Task Counter",
                description: "A simple counter widget to count tasks based on conditions.",
                minSize: 1,
                maxSize: 12,
                interval: 10000,
                autoStart: false,
            };
            this._options = {
                title: this._options.title || this._properties.label,
                timeframe: this._options.timeframe || 'all', // all, today, missed
                owner: this._options.owner || 'all', // All, or specific user id
                archived: this._options.archived ?? false, // false, true
                completed: this._options.completed ?? false, // false, true
                active: this._options.active ?? true, // true, false
                category: this._options.category || 'all', // All, or specific category
                icon: this._options.icon || 'check2-square',
                color: this._options.color || 'primary',
            };
            this._badge = null;
        }

        conditions(){
            const conditions = [];
            switch(this._options.timeframe){
                case 'today':
                    conditions.push({key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')});
                    break;
                case 'missed':
                    conditions.push({key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')});
                    break;
            }
            if(this._options.owner && this._options.owner !== 'all'){
                conditions.push({key: 'assignedTo', operator: '=', value: this._options.owner});
            }
            if(this._options.category && this._options.category !== 'all'){
                conditions.push({key: 'category', operator: '=', value: this._options.category});
            }
            if(this._options.archived){
                conditions.push({key: 'isArchived', operator: '=', value: 1});
            } else {
                conditions.push({key: 'isArchived', operator: '<>', value: 1});
            }
            if(this._options.completed){
                conditions.push({key: 'isCompleted', operator: '=', value: 1});
            } else {
                conditions.push({key: 'isCompleted', operator: '<>', value: 1});
            }
            if(this._options.active){
                conditions.push({key: 'isActive', operator: '=', value: 1});
            }
            return conditions;
        }

        title(){
            // Create a dynamic title based on options

            // Timeframe
            switch(this._options.timeframe){
                case 'all':
                    this._options.title = 'Tasks';
                    break;
                case 'today':
                    this._options.title = "Today's Tasks";
                    break;
                case 'missed':
                    this._options.title = 'Missed Tasks';
                    break;
            }

            // Owner
            switch(this._options.owner){
                case 'all':
                    break;
                default:
                    this._options.title = 'My ' + this._options.title;
                    break;
            }

            // Completed
            if(this._options.completed){
                this._options.title = this._options.title.replace('Tasks', 'Completed Tasks');
            }

            // Archived
            if(this._options.archived){
                this._options.title = this._options.title.replace('Tasks', 'Archived Tasks');
            }

            // Category
            if(this._options.category && this._options.category !== 'all'){
                this._options.title = this._options.title.replace('Tasks', this._options.category+'s');
            }

            return this._options.title;
        }

        _create(){
            const self = this;

            // Create the Badge
            this._builder.Component(
                "badge",
                this._component.gadget,
                {
                    icon: this._options.icon,
                    color: this._options.color,
                },
                function(badge,component){

                    // Set the badge
                    self._badge = badge;

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(self._builder.Locale.get(self.title())).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(0).appendTo(component.content);
                },
            );
        }

        _load(){
            const self = this;
            API.endpoint('/tasks/count').data({conditions: this.conditions()}).execute(function(response){
                self.load(response.count);
            });
        }

        _render(){
            if(this._badge){
                this._badge._component.label.text(this._builder.Locale.get(this.title()));
                this._badge._component.count.text(this._data !== null ? this._data : '0');
                this._badge._component.iconFrame.attr('class','d-flex justify-content-center align-items-center rounded text-bg-'+this._options.color);
                this._badge._component.icon.attr('class','fs-3 bi bi-'+this._options.icon);
            }
        }

        _config(form){

            // timeframe
            form.add(
                'select',
                {
                    name: 'timeframe',
                    label: this._builder.Locale.get('Timeframe'),
                    placeholder: this._builder.Locale.get('Select a timeframe'),
                    options: [
                        {id: 'all', text: this._builder.Locale.get('All Time')},
                        {id: 'today', text: this._builder.Locale.get('Today')},
                        {id: 'missed', text: this._builder.Locale.get('Missed')},
                    ],
                    value: this._options.timeframe,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // owner
            form.add(
                'select',
                {
                    name: 'owner',
                    label: this._builder.Locale.get('Owner'),
                    placeholder: this._builder.Locale.get('Select an owner'),
                    options: [
                        {id: 'all', text: this._builder.Locale.get('All Tasks')},
                        {id: USER_ID, text: this._builder.Locale.get('My Tasks only')},
                    ],
                    value: this._options.owner,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // archived
            form.add(
                'switch',
                {
                    name: 'archived',
                    label: builder.Locale.get('Count Archived Tasks'),
                    value: this._options.archived,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // completed
            form.add(
                'switch',
                {
                    name: 'completed',
                    label: builder.Locale.get('Count Completed Tasks'),
                    value: this._options.completed,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // active
            form.add(
                'switch',
                {
                    name: 'active',
                    label: builder.Locale.get('Count Active Tasks Only'),
                    value: this._options.active,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // category
            form.add(
                'select',
                {
                    name: 'category',
                    label: this._builder.Locale.get('Category'),
                    placeholder: this._builder.Locale.get('Select a category'),
                    options: [
                        {id: 'all', text: this._builder.Locale.get('Any Category')},
                        {id: 'Lead', text: 'Lead'},
                        {id: 'Client', text: 'Client'},
                        {id: 'Call', text: 'Call'},
                        {id: 'Callback', text: 'Callback'},
                        {id: 'Appointment', text: 'Appointment'},
                    ],
                    value: this._options.category,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // color
            form.add(
                'select2',
                {
                    name: 'color',
                    label: this._builder.Locale.get('Color'),
                    placeholder: this._builder.Locale.get('Select a color'),
                    options: this.colors(),
                    value: this._options.color,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                    callback:{
                        format: function(option, component){
                            if (!option.id) { return option.text; }
                            return $('<div class="px-3 py-2 animate-flicker-hover text-bg-' +  option.element.value.toLowerCase() + '" style="margin: -.375rem -.75rem!important;">' + option.text + '</div>');;
                        },
                    },
                }
            );

            // icon
            form.add(
                'select2',
                {
                    name: 'icon',
                    label: this._builder.Locale.get('Icon'),
                    placeholder: this._builder.Locale.get('Select an icon'),
                    options: this.icons(),
                    value: this._options.icon,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                    callback:{
                        format: function(option, component){
                            if (!option.id) { return option.text; }
                            return $('<span class=""><i class="me-2 text-bg-light p-1 fs-4 rounded bi bi-' +  option.element.value.toLowerCase() + '"></i>' + option.text + '</span>');
                        },
                    },
                }
            );
        }
    });

    // Register - Task Table Widget
    // A simple table widget for the dashboard to manage tasks based on conditions
    // by default it manages all tasks, but can be filtered by owner or other conditions
    dashboard.add('table-tasks', class extends dashboard.Widget {
        _init(){
            this._properties = {
                name: "table-tasks",
                label: "Task Table",
                description: "A simple table widget to manage tasks based on conditions.",
                minSize: 1,
                maxSize: 12,
                interval: 10000,
                autoStart: false,
            };
            this._options = {
                title: this._options.title || this._properties.label,
                timeframe: this._options.timeframe || 'all', // all, today, missed
                owner: this._options.owner || 'all', // All, or specific user id
                archived: this._options.archived ?? false, // false, true
                completed: this._options.completed ?? false, // false, true
                active: this._options.active ?? true, // true, false
                category: this._options.category || 'all', // All, or specific category
                icon: this._options.icon || 'check2-square',
            };
            this._card = null;
            this._table = null;
        }

        conditions(){
            const conditions = [];
            switch(this._options.timeframe){
                case 'today':
                    conditions.push({key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')});
                    break;
                case 'missed':
                    conditions.push({key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')});
                    break;
            }
            if(this._options.owner && this._options.owner !== 'all'){
                conditions.push({key: 'assignedTo', operator: '=', value: this._options.owner});
            }
            if(this._options.category && this._options.category !== 'all'){
                conditions.push({key: 'category', operator: '=', value: this._options.category});
            }
            if(this._options.archived){
                conditions.push({key: 'isArchived', operator: '=', value: 1});
            } else {
                conditions.push({key: 'isArchived', operator: '<>', value: 1});
            }
            if(this._options.completed){
                conditions.push({key: 'isCompleted', operator: '=', value: 1});
            } else {
                conditions.push({key: 'isCompleted', operator: '<>', value: 1});
            }
            if(this._options.active){
                conditions.push({key: 'isActive', operator: '=', value: 1});
            }
            return conditions;
        }

        title(){
            // Create a dynamic title based on options

            // Timeframe
            switch(this._options.timeframe){
                case 'all':
                    this._options.title = 'Tasks';
                    break;
                case 'today':
                    this._options.title = "Today's Tasks";
                    break;
                case 'missed':
                    this._options.title = 'Missed Tasks';
                    break;
            }

            // Owner
            switch(this._options.owner){
                case 'all':
                    break;
                default:
                    this._options.title = 'My ' + this._options.title;
                    break;
            }

            // Completed
            if(this._options.completed){
                this._options.title = this._options.title.replace('Tasks', 'Completed Tasks');
            }

            // Archived
            if(this._options.archived){
                this._options.title = this._options.title.replace('Tasks', 'Archived Tasks');
            }

            // Category
            if(this._options.category && this._options.category !== 'all'){
                this._options.title = this._options.title.replace('Tasks', this._options.category+'s');
            }

            return this._options.title;
        }

        _create(){

            // Set Self
            const self = this;

            // Set Column Definitions
            const columnDefs = [];
            for(const [key, definition] of Object.entries(tasksDefinition)){
                columnDefs.push(definition);
            }

            // Create the Card
            this._builder.Component(
                'card',
                this._component.gadget,
                {
                    icon: this._options.icon,
                    title: this.title(),
                },
                function(card, component){

                    // Set _card
                    self._card = card;

                    // Styling
                    component.body.addClass('p-0');

                    // Create the Table
                    self._builder.Component(
                        'datatable',
                        component.body,
                        {
                            class: {
                                component: 'tasks-feed',
                                buttons: 'tasks-controls',
                                table: 'tasks-table',
                                footer: 'tasks-footer',
                            },
                            standardSearch: true,
                            advancedSearch: false,
                            exportTools: false,
                            showButtonsLabel: false,
                            actions: {
                                details:{
                                    label: self._builder.Locale.get('Details'),
                                    icon: 'eye',
                                    action:function(event, table, dt, node, row, data){
                                        self._builder.Widget('task',{data: data.id}).view();
                                    }
                                },
                                reschedule:{
                                    label:'Re-Schedule',
                                    icon:'calendar-week',
                                    action:function(event, table, dt, node, row, data){
                                        self._builder.Widget('task',{data: data.id}).schedule(function(response){
                                            dt.row(row).data(response.record).draw();
                                        });
                                    }
                                },
                                archive:{
                                    label: self._builder.Locale.get('Archive'),
                                    icon: 'archive',
                                    action:function(event, table, dt, node, row, data){
                                        self._builder.Widget('task',{data: data.id}).archive(function(response){
                                            self._table.delete(row);
                                        });
                                    }
                                },
                            },
                            dblclick: function(event, table, dt, node, data){
                                self._builder.Widget('task',{data: data.id}).view();
                            },
                            datatable: {
                                responsive: {
                                    breakpoints: [
                                        { name: 'xl', width: Infinity },
                                        { name: 'lg', width: 1400 },
                                        { name: 'md', width: 992 },
                                        { name: 'sm', width: 768 },
                                        { name: 'xs', width: 576 },
                                        { name: 'xxs', width: 0 }
                                    ]
                                },
                                buttons: [],
                                columnDefs: columnDefs,
                                order: [[15, 'asc']],
                                initComplete: function(param) {
                                    $(param.nTableWrapper).find('.dataTables_filter input').attr({
                                        'placeholder': builder.Locale.get('Search...'),
                                    });
                                },
                            },
                        },
                        function(table, component){

                            // Set _table
                            self._table = table;
                        },
                    );
                },
            );
        }

        _load(){
            const self = this;
            API.endpoint('/tasks/fetchAll').data({conditions: this.conditions()}).execute(function(response){
                self.load(response.records);
            });
        }

        _render(){

            // Render Card
            if(this._card){
                // Icon
                this._card._component.header.icon.attr('class','me-1 bi bi-'+this._options.icon);
                // Title
                this._card._component.header.title.text(this.title());
            }

            // Render Table
            if(this._table){

                // Data
                for(const [key, record] of Object.entries(this._data)){
                    this._table.add(record);
                }
            }
        }

        _config(form){

            // timeframe
            form.add(
                'select',
                {
                    name: 'timeframe',
                    label: this._builder.Locale.get('Timeframe'),
                    placeholder: this._builder.Locale.get('Select a timeframe'),
                    options: [
                        {id: 'all', text: this._builder.Locale.get('All Time')},
                        {id: 'today', text: this._builder.Locale.get('Today')},
                        {id: 'missed', text: this._builder.Locale.get('Missed')},
                    ],
                    value: this._options.timeframe,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // owner
            form.add(
                'select',
                {
                    name: 'owner',
                    label: this._builder.Locale.get('Owner'),
                    placeholder: this._builder.Locale.get('Select an owner'),
                    options: [
                        {id: 'all', text: this._builder.Locale.get('All Tasks')},
                        {id: USER_ID, text: this._builder.Locale.get('My Tasks only')},
                    ],
                    value: this._options.owner,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // archived
            form.add(
                'switch',
                {
                    name: 'archived',
                    label: builder.Locale.get('Count Archived Tasks'),
                    value: this._options.archived,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // completed
            form.add(
                'switch',
                {
                    name: 'completed',
                    label: builder.Locale.get('Count Completed Tasks'),
                    value: this._options.completed,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // active
            form.add(
                'switch',
                {
                    name: 'active',
                    label: builder.Locale.get('Count Active Tasks Only'),
                    value: this._options.active,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // category
            form.add(
                'select',
                {
                    name: 'category',
                    label: this._builder.Locale.get('Category'),
                    placeholder: this._builder.Locale.get('Select a category'),
                    options: [
                        {id: 'all', text: this._builder.Locale.get('Any Category')},
                        {id: 'Lead', text: 'Lead'},
                        {id: 'Client', text: 'Client'},
                        {id: 'Call', text: 'Call'},
                        {id: 'Callback', text: 'Callback'},
                        {id: 'Appointment', text: 'Appointment'},
                    ],
                    value: this._options.category,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // icon
            form.add(
                'select2',
                {
                    name: 'icon',
                    label: this._builder.Locale.get('Icon'),
                    placeholder: this._builder.Locale.get('Select an icon'),
                    options: this.icons(),
                    value: this._options.icon,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                    callback:{
                        format: function(option, component){
                            if (!option.id) { return option.text; }
                            return $('<span class=""><i class="me-2 text-bg-light p-1 fs-4 rounded bi bi-' +  option.element.value.toLowerCase() + '"></i>' + option.text + '</span>');
                        },
                    },
                }
            );
        }
    });
}

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
