// Unassign a Task
const TaskUnassign = function(task, callback = null){
    builder.Component(
        "modal",
        null,
        {
            onEnter: true,
            destroy:true,
            icon: "person-dash",
            title: builder.Locale.get("Are you sure?"),
            body: builder.Locale.get("You are about to unassign this object. Are you sure you want to continue?"),
            cancel: false,
            submit: true,
            size: "md",
            callback: {
                submit: function(element,modal){
                    $.ajax({
                        url: '/api/tasks/update?id='+task.id,
                        headers: {'X-CSRF-Authorization': CSRF_KEY},
                        type: 'POST',dataType: 'json',
                        data: {assignedTo: null},
                        success: function(response) {

                            const complete = function(){

                                // Update Assigned User
                                $('[data-type="avatar"][data-task="'+task.id+'"]').each(function(){
                                    var avatar = $(this);
                                    avatar.html(builder.Avatar.avatar(null));
                                });

                                // Update the task
                                task.assignedTo = null;

                                // Execute Callback
                                if(typeof callback === "function"){
                                    callback(task, response);
                                }

                                // Hide Modal
                                modal.hide();
                            }

                            // Check if the root of the task has an assignedTo field
                            if(typeof task.root !== "undefined" && typeof task.root.target !== "undefined" && typeof task.root.target.assignedTo !== "undefined"){
                                $.ajax({
                                    url: '/api/'+task.root.targetTable+'/update?id='+task.root.targetId,
                                    headers: {'X-CSRF-Authorization': CSRF_KEY},
                                    type: 'POST',dataType: 'json',
                                    data: {assignedTo: null},
                                    success: function(response) {
                                        complete();
                                    }
                                });
                            } else {
                                complete();
                            }
                        }
                    });
                },
            },
        },
        function(modal,component){
            component.header.addClass('text-bg-warning');
            component.footer.submit
                .addClass('btn-warning')
                .removeClass('btn-link')
                .text(builder.Locale.get('Unassign'))
                .attr('style','border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;');
            component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-person-dash me-1').prependTo(component.footer.submit);
            modal.show();
        }
    );
};
// Archive a Task
const TaskArchive = function(task){

    // Create a modal
    builder.Component(
        "modal",
        null,
        {
            onEnter: false,
            destroy: true,
            icon: "archive",
            title: builder.Locale.get("Are you sure you?"),
            body: builder.Locale.get("Your are about to archive this task. Are you sure you want to continue?"),
            cancel: false,
            submit: true,
            callback: {
                submit: function(element,modal){

                    // Create a spinner animate-rotate
                    var spinner = $(document.createElement('div')).attr({
                        "class": "animate-rotate rounded-circle border border-secondary border-4 d-none",
                        "style": "width: 96px; height: 96px; border-top-color: var(--bs-primary)!important;",
                    }).appendTo(element);

                    // Hide the dialog
                    element.dialog.addClass('opacity-0');

                    // Setup a spinner while waiting for the modal to be submitted
                    setTimeout(() => {

                        // Hide the dialog
                        element.dialog.hide();

                        // Add flex to the modal
                        element.addClass('d-flex align-items-center justify-content-center');

                        // Show the spinner
                        spinner.removeClass('d-none');

                        // AJAX Request
                        $.ajax({
                            url: '/api/tasks/archive?id='+task.id,
                            type: 'GET',dataType: 'json',
                            success: function(response) {

                                // AJAX Request
                                $.ajax({
                                    url: '/api/'+task.targetTable+'/fetch?id='+task.targetId,
                                    type: 'GET',dataType: 'json',
                                    error: function(xhr, status, error) {
                                        if(xhr.status === 404){
                                            // If the target is not found, we can assume it has been archived
                                            // Hide the modal
                                            modal.hide();
                                        }
                                    },
                                    success: function(response) {

                                        // AJAX Request
                                        $.ajax({
                                            url: '/api/'+task.targetTable+'/archive?id='+task.targetId,
                                            type: 'GET',dataType: 'json',
                                            success: function(response) {

                                                // Hide the modal
                                                modal.hide();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }, 300);
                },
            },
        },
        function(modal,component){

            // Save the component
            const componentModal = component;

            // Style the modal
            component.header.addClass('text-bg-dark');
            component.footer.submit.addClass('btn-dark').removeClass('btn-link').attr({
                "style": "border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;",
            }).text(builder.Locale.get('Archive'));
            component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-archive me-1').prependTo(component.footer.submit);

            // Open the modal
            modal.show();
        },
    );
};
// Details of a Task
const TaskDetails = function(id, element, callback = null){

    // Ensure Storage is ready
    (async function () {
        await builder.Storage._ensureReady?.();
        // AJAX Request
        $.ajax({
            url: '/api/tasks/fetch?id='+id,
            type: 'GET',dataType: 'json',
            success: async function(response) {

                // Configure Storage
                builder.Storage.setKey(`task:${response.record.id}`);
                await builder.Storage.set(response);
                console.log(await builder.Storage.get());

                // Clear the details, notes and progress
                element.html('');

                // Create a Card for the task details
                const Progress = builder.Component(
                    "card",
                    element,
                    {
                        class: {
                            component: "mb-3",
                            body: "p-0",
                        },
                        icon: "check-square",
                        title: builder.Locale.get("Progress"),
                    },
                    async function(card,component){

                        // Retrieve the record
                        let record = await builder.Storage.get('record');

                        // Create a progress bar
                        ProcessTree(record, component.body, component.body);
                    },
                );

                // Create a Tabs for the task
                const Tabs = builder.Component(
                    "tabs",
                    element,
                    {
                        class: {
                            navbar: 'nav-pills',
                        },
                    },
                    async function(tabs,card){

                        // Retrieve the record
                        let record = await builder.Storage.get('record');

                        // Set the table
                        let table = 'tasks'

                        // Styling
                        card._component.body.removeClass('card-body');

                        // Details
                        tabs.add(
                            'details',
                            {
                                icon: "info-circle",
                                label: builder.Locale.get("Details"),
                            },
                            function(tab,nav){

                                // Styling
                                tab.addClass('px-4 py-3 position-relative');

                                // Add a controls area
                                let controls = $(document.createElement('div')).addClass('position-absolute btn-group top-0 end-0 p-3').appendTo(tab);
                                controls.archive = $(document.createElement('button')).attr({
                                    "class": "btn btn-sm btn-dark",
                                }).html('<i class="bi bi-archive me-2"></i>'+builder.Locale.get("Archive")).appendTo(controls);
                                controls.archive.click(function(){
                                    TaskArchive(record);
                                });

                                // Create a grid for the details
                                let row = $(document.createElement('div')).addClass('row g-3').appendTo(tab);

                                // Update the details
                                for(const [key, value] of Object.entries(record)){
                                    switch(key){
                                        case 'label':
                                            let cellLabel = $(document.createElement('div')).addClass('col-12 d-flex align-items-center').html('<h4 class="m-0">'+builder.Parser.parse(value)+'</h4>').appendTo(row);
                                            cellLabel.find('[data-vcard]').off().click(function(){
                                                vCardModal($(this).attr('data-vcard'),$(this).attr('data-vcard-name'));
                                            });
                                            break;
                                        case 'progress':
                                            var cellProgress = $(document.createElement('div')).addClass('col-6').appendTo(row);
                                            cellProgress.header = $(document.createElement('h4')).addClass('w-100 m-0').appendTo(cellProgress);
                                            if(value){
                                                cellProgress.badge = $(document.createElement('span')).addClass('badge w-100 text-bg-'+record.process[record.progress].color).text(builder.Locale.get(record.process[record.progress].name)).appendTo(cellProgress.header);
                                                cellProgress.icon = $(document.createElement('i')).addClass('me-1 bi bi-'+record.process[record.progress].icon).prependTo(cellProgress.badge);
                                            } else {
                                                cellProgress.badge = $(document.createElement('span')).addClass('badge w-100 text-bg-success').text(builder.Locale.get('New')).appendTo(cellProgress.header);
                                                cellProgress.icon = $(document.createElement('i')).addClass('me-1 bi bi-stars').prependTo(cellProgress.badge);
                                            }
                                            cellProgress.badge.attr({"data-type": "status", "data-task": record.id});
                                            break;
                                        case 'priority':
                                            let color = ['secondary','primary','warning','orange','danger'];
                                            let name = ['Low','Normal','High','Urgent','Critical'];
                                            let icon = ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'];
                                            cellPriority = $(document.createElement('div')).addClass('col-6 cursor-pointer').appendTo(row);
                                            '<span class="badge w-100 text-bg-'+color[value]+'"><i class="me-1 bi bi-'+icon[value]+'"></i>'+builder.Locale.get(name[value])+'</span>'
                                            cellPriority.heading = $(document.createElement('h4')).attr({
                                                "class": "w-100 m-0",
                                            }).appendTo(cellPriority);
                                            cellPriority.badge = $(document.createElement('span')).attr({
                                                "class": "badge w-100 text-bg-"+color[value],
                                                "data-type": "priority",
                                                "data-task": record.id,
                                            }).html('<i class="me-1 bi bi-'+icon[value]+'"></i>'+builder.Locale.get(name[value])).appendTo(cellPriority.heading);
                                            cellPriority.click(function(){
                                                TaskPriorityModal(record);
                                            });
                                            break;
                                        case 'assignedTo':
                                            let cellAssignedTo = $(document.createElement('div')).addClass('col-6 py-0').appendTo(row);
                                            cellAssignedTo.trigger = $(document.createElement('div')).addClass('px-3 py-2 rounded').attr('style','transition: all 300ms ease 0s;').appendTo(cellAssignedTo);
                                            cellAssignedTo.avatar = $(document.createElement('div')).attr({
                                                "class": "d-flex align-items-center",
                                                "data-type": 'avatar',
                                                "data-task": record.id,
                                            }).appendTo(cellAssignedTo.trigger);
                                            cellAssignedTo.avatar.username = $(document.createElement('span')).attr({
                                                "class": "my-1",
                                                "data-bs-toggle": "tooltip",
                                                "data-bs-placement": "top",
                                                "title": record.assignedTo.username,
                                                "data-bs-title": record.assignedTo.username,
                                            }).text(record.assignedTo.username).appendTo(cellAssignedTo.avatar);
                                            cellAssignedTo.avatar.avatar = $(document.createElement('img')).attr({
                                                "class": "rounded-circle me-1",
                                                "alt": record.assignedTo.username,
                                                "style": "width: 48px; height: 48px;",
                                                "src": "/avatar?username="+record.assignedTo.username,
                                            }).prependTo(cellAssignedTo.avatar);
                                            cellAssignedTo.trigger.hover(
                                                function(){
                                                    cellAssignedTo.trigger.addClass('text-bg-secondary cursor-pointer');
                                                },
                                                function(){
                                                    cellAssignedTo.trigger.removeClass('text-bg-secondary cursor-pointer');
                                                },
                                            );
                                            cellAssignedTo.trigger.click(function(){
                                                TaskAssignModal(record);
                                            });
                                            break;
                                        case 'due':
                                            let cellDue = $(document.createElement('div')).addClass('col-6 py-0').appendTo(row);
                                            cellDue.trigger = $(document.createElement('div')).addClass('px-3 py-2 rounded').attr('style','transition: all 300ms ease 0s;').appendTo(cellDue);
                                            cellDue.flex = $(document.createElement('div')).addClass('d-flex justify-content-start align-items-center').appendTo(cellDue.trigger);
                                            cellDue.icon = $(document.createElement('div')).addClass('me-2 rounded-circle p-2 text-bg-primary d-flex justify-content-center align-items-center').css({"height":"48px","width":"48px"}).html('<i class="bi bi-calendar-event" style="font-size:1.25rem;"></i>').appendTo(cellDue.flex);
                                            cellDue.date = $(document.createElement('div')).html(moment(value).format('YYYY-MM-DD HH:mm')).appendTo(cellDue.flex);
                                            cellDue.trigger.hover(
                                                function(){
                                                    cellDue.trigger.addClass('text-bg-secondary cursor-pointer');
                                                },
                                                function(){
                                                    cellDue.trigger.removeClass('text-bg-secondary cursor-pointer');
                                                },
                                            );
                                            cellDue.trigger.click(function(){
                                                builder.Component(
                                                    "modal",
                                                    null,
                                                    {
                                                        onEnter: true,
                                                        destroy:true,
                                                        icon: "calendar-event",
                                                        title: builder.Locale.get("Change Due Date"),
                                                        cancel: false,
                                                        submit: true,
                                                        size: "md",
                                                        callback: {
                                                            submit: function(element,modal){
                                                                element.form.submit();
                                                            },
                                                        },
                                                    },
                                                    function(modal,component){
                                                        component.header.addClass('text-bg-warning');
                                                        component.footer.submit
                                                            .addClass('btn-success')
                                                            .removeClass('btn-link')
                                                            .attr('style','border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;');
                                                        component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-save me-1').prependTo(component.footer.submit);
                                                        component.form = builder.Component(
                                                            "form",
                                                            component.body,
                                                            {
                                                                callback:{
                                                                    val: function(values){
                                                                        values.due = values.date+" "+values.time;
                                                                        delete values.date;
                                                                        delete values.time;
                                                                        return values;
                                                                    },
                                                                    submit: function(form){
                                                                        const values = form.val();
                                                                        $.ajax({
                                                                            url: '/api/tasks/update?id='+record.id,
                                                                            headers: {'X-CSRF-Authorization': CSRF_KEY},
                                                                            type: 'POST',dataType: 'json',
                                                                            data: values,
                                                                            success: function(response) {
                                                                                cellDue.date.html(moment(values.due).format('YYYY-MM-DD HH:mm'));
                                                                                modal.hide();
                                                                            }
                                                                        });
                                                                    },
                                                                },
                                                            },
                                                            function(form,component){
                                                                form.add(
                                                                    {
                                                                        class: { field: 'mb-3' },
                                                                        name: 'date',
                                                                        label: builder.Locale.get('Date'),
                                                                        icon: 'calendar',
                                                                        type: 'date',
                                                                        value: value ? value.split(' ')[0] : moment().format('YYYY-MM-DD'),
                                                                    },
                                                                );
                                                                form.add(
                                                                    {
                                                                        name: 'time',
                                                                        label: builder.Locale.get('Time'),
                                                                        icon: 'clock',
                                                                        type: 'time',
                                                                        value: value ? value.split(' ')[1] : moment().format('HH:mm'),
                                                                    },
                                                                );
                                                                modal.show();
                                                            },
                                                        );
                                                    },
                                                );
                                            });
                                            break;
                                        case 'link':
                                            let cellLink = $(document.createElement('div')).addClass('col-12 py-0').appendTo(row);
                                            cellLink.trigger = $(document.createElement('div')).addClass('px-3 py-2 rounded').attr('style','transition: all 300ms ease 0s;').appendTo(cellLink);
                                            cellLink.flex = $(document.createElement('div')).addClass('d-flex justify-content-start align-items-center').appendTo(cellLink.trigger);
                                            cellLink.icon = $(document.createElement('div')).addClass('me-2 rounded-circle p-2 text-bg-info d-flex justify-content-center align-items-center').css({"height":"48px","width":"48px"}).html('<i class="bi bi-link-45deg" style="font-size:1.25rem;"></i>').appendTo(cellLink.flex);
                                            cellLink.label = $(document.createElement('div')).text(builder.Locale.get('Linked Object')).appendTo(cellLink.flex);
                                            cellLink.trigger.hover(
                                                function(){
                                                    cellLink.trigger.addClass('text-bg-secondary cursor-pointer');
                                                },
                                                function(){
                                                    cellLink.trigger.removeClass('text-bg-secondary cursor-pointer');
                                                },
                                            );
                                            cellLink.trigger.click(function(){
                                                window.location.href = value;
                                            });
                                            break;
                                    }
                                }
                            },
                        );

                        // Retrieve the notes
                        let notes = await builder.Storage.get('dependencies:notes');

                        // Add the Notes tab
                        tabs.add(
                            'notes',
                            {
                                icon: "stickies",
                                label: builder.Locale.get("Notes"),
                            },
                            function(tab,nav){
                                card.notes = tab;
                                NotesFeed(notes ?? [], tab, record.root.targetTable, record.root.targetId);
                            },
                        );

                        // Retrieve the event
                        let event = await builder.Storage.get('dependencies:event');

                        // Add the Event tab
                        tabs.add(
                            'activities',
                            {
                                icon: "activity",
                                label: builder.Locale.get("Activity"),
                            },
                            function(tab,nav){
                                tab.addClass('px-4 py-3');
                                EventFeed(event, tab);
                            },
                        );

                        // Retrieve the relationship
                        let relationship = await builder.Storage.get('dependencies:relationship');

                        // Add the Relationship tab
                        tabs.add(
                            'related',
                            {
                                icon: "diagram-2",
                                label: builder.Locale.get("Related"),
                            },
                            function(tab,nav){
                                tab.addClass('px-4 py-3');
                                card.related = tab;
                                RelationshipFeed(relationship, tab, table, record.id, function(feed){
                                    card.related.feed = feed;
                                });
                            },
                        );
                    },
                );

                // Execute Callback
                if(typeof callback === "function"){
                    callback(Progress, Tabs);
                }
            }
        });
    })();
};
// Task Modal
const TaskModal = function(id){

    // Create a modal for the task details
    builder.Component(
        "modal",
        {
            onEnter: true,
            destroy:true,
            icon: "check-square",
            title: builder.Locale.get("Task Details"),
            cancel: false,
            submit: false,
            size: "xl",
        },
        function(modal,component){

            // Styling
            component.header.addClass('text-bg-primary');
            component.body.addClass('p-0');
            component.footer.remove();

            // Setup the details
            TaskDetails(id, component.body, function(Progress, Tabs){

                // Styling
                Progress._component.removeClass('mb-3');
                Progress._component.card.addClass('bg-transparent rounded-0');
                Progress._component.tools.remove();
                Tabs._component._component.card.addClass('bg-transparent rounded-top-0');
                Tabs._component._component.tools.remove();

                // Open the modal
                modal.show();
            });
        }
    );
};
// Set Task Priority
const TaskPriorityModal = function(task){

    // Priority Options
    let color = ['secondary','primary','warning','orange','danger'];
    let name = ['Low','Normal','High','Urgent','Critical'];
    let icon = ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'];
    builder.Component(
        "modal",
        null,
        {
            onEnter: true,
            destroy:true,
            icon: "exclamation-triangle",
            title: builder.Locale.get("Change Priority"),
            cancel: false,
            submit: true,
            size: "md",
            callback: {
                submit: function(element,modal){
                    element.form.submit();
                },
            },
        },
        function(modal,component){
                component.header.addClass('text-bg-warning');
                component.footer.submit
                    .addClass('btn-success')
                    .removeClass('btn-link')
                    .attr('style','border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;');
                component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-save me-1').prependTo(component.footer.submit);
            component.form = builder.Component(
                "form",
                component.body,
                {
                    callback:{
                        submit: function(form){
                            const values = form.val();
                            $.ajax({
                                url: '/api/tasks/update?id='+task.id,
                                headers: {'X-CSRF-Authorization': CSRF_KEY},
                                type: 'POST',dataType: 'json',
                                data: values,
                                success: function(response) {

                                    // Update Priority Badges
                                    $('[data-type="priority"][data-task="'+task.id+'"]').each(function(){
                                        var badge = $(this);
                                        // Remove all background classes
                                        badge.removeClass(function (index, className) {
                                            return (className.match (/(^|\s)text-bg-\S+/g) || []).join(' ');
                                        });
                                        // Set the new background class
                                        badge.addClass('text-bg-'+color[values.priority]);
                                        // Set the new text
                                        badge.text(name[values.priority]);
                                        // Set the new icon
                                        badge.icon = $(document.createElement('i')).addClass('me-1 bi bi-'+icon[values.priority]).prependTo(badge);
                                    });

                                    // Close Modal
                                    modal.hide();
                                }
                            });
                        },
                    },
                },
                function(form,component){
                    form.add(
                        {
                            name: 'priority',
                            label: builder.Locale.get('Level'),
                            icon: 'exclamation-triangle',
                            type: 'select',
                            options: [
                                {id: 0, text: builder.Locale.get(name[0])},
                                {id: 1, text: builder.Locale.get(name[1])},
                                {id: 2, text: builder.Locale.get(name[2])},
                                {id: 3, text: builder.Locale.get(name[3])},
                                {id: 4, text: builder.Locale.get(name[4])},
                            ],
                            value: task.priority,
                        },
                    );
                    modal.show();
                },
            );
        },
    );
}
// Set Task Assigned User
const TaskAssignModal = function(task, callback = null){
    $.ajax({
        url: '/api/tasks/fetch?id=' + task.id,
        type: 'GET',dataType: 'json',
        success: function(response) {
            if(response.record.assignedTo.username){
                TaskUnassign(response.record, callback);
            } else {
                process_function_TaskAssign(response.record, null, callback);
            }
        },
    });
}
// Create a Task Table
const TaskTable = function(container, tasks, assignedTo = false, callback = null){

    // Set Actions
    var actions = {
        details:{
            label:'Details',
            icon:'eye',
            action:function(event, table, dt, node, row, data){
                TaskModal(data.id);
            }
        },
    };

    // Set Buttons
    var buttons = [];

    // Column Definitions
    var columnDefs = [
        { target: 0, visible: false, title: builder.Locale.get('ID'), name: 'id', data: 'id', render: function(data, type, row) {
            var object = $(document.createElement('span'))
                .addClass('my-2')
                .text(data)
            return object.prop('outerHTML');
        }},
        { target: 1, visible: false, title: builder.Locale.get('Category'), name: 'category', data: 'category', render: function(data, type, row) {
            var object = $(document.createElement('span'))
                .addClass('my-2')
                .text(data)
            return object.prop('outerHTML');
        }},
        { target: 2, visible: true, title: builder.Locale.get('Label'), width: '50%', name: 'label', data: 'label', render: function(data, type, row) {
            return '<h4 class="m-0">'+builder.Parser.parse(data)+'</h4>';
        }},
        { target: 3, visible: false, title: builder.Locale.get('Status'), name: 'status', data: 'status', render: function(data, type, row) {
            if(row.progress == 0) {
                return '<h5><span class="badge text-bg-success" data-type="status" data-task="'+row.id+'"><i class="me-1 bi bi-asterisk"></i>'+builder.Locale.get('New')+'</span></h5>';
            } else {
                return '<h5><span class="badge text-bg-'+row.process[row.progress].color+'" data-type="status" data-task="'+row.id+'"><i class="me-1 bi bi-'+row.process[row.progress].icon+'"></i>'+row.process[row.progress].name+'</span></h5>';
            }
        }},
        { target: 4, visible: true, title: builder.Locale.get('Task'), name: 'task', data: 'task', render: function(data, type, row) {
            for(const [progress, step] of Object.entries(row.process)){
                for(const [order, task] of Object.entries(step.tasks)){
                    if(!task.isCompleted){
                        return '<h5><span class="badge text-bg-'+step.color+'"><i class="me-1 bi bi-'+step.icon+'"></i>'+task.name+'</span></h5>';
                        break;
                    }
                }
            }
        }},
        { target: 5, visible: true, title: builder.Locale.get('Priority'), name: 'priority', data: 'priority', render: function(data, type, row) {
            let color = ['secondary','primary','warning','orange','danger'];
            let name = ['Low','Normal','High','Urgent','Critical'];
            let icon = ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'];
            return '<h5><span class="badge text-bg-'+color[row.priority]+'" data-type="priority" data-task="'+row.id+'"><i class="me-1 bi bi-'+icon[row.priority]+'"></i>'+builder.Locale.get(name[row.priority])+'</span></h5>';
        }},
        { target: 6, visible: assignedTo, title: builder.Locale.get('Assigned To'), name: 'assignedTo', data: 'assignedTo', render: function(data, type, row) {

            // If no users
            if(data.username == null || data.username == ''){
                return '';
            }

            // Create element
            var element = $(document.createElement('div')).addClass('d-flex flex-column');

            // Create Badge
            var object = $(document.createElement('span'))
                .addClass('d-flex align-items-center my-1')
                .attr('data-bs-toggle','tooltip')
                .attr('data-bs-placement','top')
                .attr('title',data.username)
                .attr('data-bs-title',data.username)
                .text(data.username);

            // Create avatar
            var avatar = $(document.createElement('img'))
                .addClass('rounded-circle me-1')
                .attr('alt',data.username)
                .css({
                    width: '32px',
                    height: '32px',
                })
                .attr('src','/avatar?username='+data.username)
                .prependTo(object);

            // Append to element
            object.appendTo(element);

            // Return element
            return element.prop('outerHTML');
        }},
        { target: 7, visible: true, title: builder.Locale.get('Due'), name: 'due', data: 'due', render: function(data, type, row) {
            // Handle sorting
            if (type === 'sort') {
                return data ? Date.parse(data) : Number.MAX_SAFE_INTEGER;
            }
            // If no due date
            if(data == null || data == ''){
                return '';
            }
            var bg = 'btn-secondary';
            if(moment(row.due).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')){
                bg = 'btn-warning';
            }
            if(moment(row.due).isBefore(moment())){
                bg = 'text-bg-danger';
            }
            var object = $(document.createElement('button')).attr({
                'data-id': row.id,
                'data-type': 'due',
                'data-bs-toggle': 'tooltip',
                'data-bs-placement': 'top',
                'title': row.due,
                'class': 'btn btn-sm cursor-default '+bg,
            });
            object.icon = $(document.createElement('i')).addClass('bi bi-clock me-1').prependTo(object);
            object.ago = $(document.createElement('time')).attr({
                'datetime': row.due,
                'class': 'cursor-default',
            }).text(row.due).appendTo(object);
            setInterval(function(){
                $('[data-type="followups"] button[data-type="due"][data-id="'+row.id+'"]').each(function(){
                    $(this).tooltip();
                });
            }, 100);
            return object.prop('outerHTML');
        }},
    ];

    // Create the table
    builder.Component(
        "table",
        container,
        {
            class: {
                buttons: "px-4 pt-4",
                table: "border-top",
                footer: "px-4 pt-2 pb-4",
            },
            showButtonsLabel: true,
            selectTools:false,
            actions:actions,
            datatable:{
                columnDefs:columnDefs,
                buttons:buttons,
                order: [[7, 'asc']],
            },
            dblclick:function(event, table, dt, node, data){
                actions.details.action(event, table, dt, node, null, data);
            },
        },
        function(table,component){
            for(const [key, record] of Object.entries(tasks)){
                table.add(record);
            }
            return container;
        },
    );
}

// Assign a Task
function process_function_TaskAssign(task, value, callback = null){

    // Initialize the should assign variable
    var shouldAssign = true;

    // Check if the task is already assigned
    if(task.assignedTo.id !== null){
        shouldAssign = false;
    }

    // Check if the task as a root and if the root is assigned.
    if(typeof task.root !== "undefined" && typeof task.root.target !== "undefined" && typeof task.root.target.assignedTo !== "undefined" && task.root.target.assignedTo.id !== null){
        shouldAssign = false;
    }

    // Check if we should assign the task
    if(shouldAssign){

        // AJAX Request
        $.ajax({
            url: '/api/auth/users',
            type: 'GET',dataType: 'json',
            success: function(response) {
                var members = response.records;
                var options = [];
                for(const [id, member] of Object.entries(members)){
                    options.push({id: id, text: member.username});
                }
                builder.Component(
                    "modal",
                    null,
                    {
                        onEnter: true,
                        destroy:true,
                        icon: "person-add",
                        title: builder.Locale.get("Assign Someone"),
                        cancel: false,
                        submit: true,
                        size: "md",
                        callback: {
                            submit: function(element,modal){
                                element.form.submit();
                            },
                        },
                    },
                    function(modal,component){
                        const componentModal = component;
                        component.header.addClass('text-bg-primary');
                        component.footer.submit
                            .addClass('btn-primary')
                            .removeClass('btn-link')
                            .text(builder.Locale.get('Assign'))
                            .attr('style','border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;');
                        component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-person-add me-1').prependTo(component.footer.submit);
                        component.form = builder.Component(
                            "form",
                            component.body,
                            {
                                callback:{
                                    submit: function(form){
                                        const values = form.val();
                                        $.ajax({
                                            url: '/api/tasks/update?id='+task.id,
                                            headers: {'X-CSRF-Authorization': CSRF_KEY},
                                            type: 'POST',dataType: 'json',
                                            data: values,
                                            success: function(response) {

                                                const complete = function(){

                                                    // Update Assigned User
                                                    $('[data-type="avatar"][data-task="'+task.id+'"]').each(function(){
                                                        var avatar = $(this);
                                                        avatar.html(builder.Avatar.avatar(members[values.assignedTo].username));
                                                    });

                                                    // Update the task
                                                    task.assignedTo = members[values.assignedTo];

                                                    // Execute Callback
                                                    if(typeof callback === "function"){
                                                        callback(task, response);
                                                    }

                                                    // Hide Modal
                                                    modal.hide();
                                                }

                                                // Check if the root of the task has an assignedTo field
                                                if(typeof task.root !== "undefined" && typeof task.root.target !== "undefined" && typeof task.root.target.assignedTo !== "undefined"){
                                                    $.ajax({
                                                        url: '/api/'+task.root.targetTable+'/update?id='+task.root.targetId,
                                                        headers: {'X-CSRF-Authorization': CSRF_KEY},
                                                        type: 'POST',dataType: 'json',
                                                        data: values,
                                                        success: function(response) {
                                                            complete();
                                                        }
                                                    });
                                                } else {
                                                    complete();
                                                }
                                            }
                                        });
                                    },
                                },
                            },
                            function(form,component){
                                form.add(
                                    {
                                        name: 'assignedTo',
                                        label: builder.Locale.get('User'),
                                        icon: 'person',
                                        type: 'select2',
                                        options: options,
                                        modal: componentModal,
                                        value: USER_ID,
                                    },
                                );
                                modal.show();
                            },
                        );
                    }
                );
            }
        });
    } else {

        // Execute Callback
        if(typeof callback === "function"){
            callback(task, null);
        }
    }
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
    $.ajax({
        url: '/api/tasks/update?id='+task.id,
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {isActive: 1},
        success: function(response) {

            // Execute Callback
            if(typeof callback === "function"){
                callback(task, response);
            }
        },
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
    $.ajax({
        url: '/api/tasks/update?id='+task.id,
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {isActive: 0},
        success: function(response) {

            // Execute Callback
            if(typeof callback === "function"){
                callback(task, response);
            }
        },
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableTasks('label')),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records, true);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'category', operator: '=', value: value},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableTasksCategorized('label').replace('Categorized',value)),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records, true);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableDailyTasks('label')),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'category', operator: '=', value: value},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableDailyTasksCategorized('label').replace('Categorized',value)),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableMyTasks('label')),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableMyTasksCategorized('label').replace('Categorized',value)),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableMyDailyTasks('label')),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/fetchAll',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'isCompleted', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "card",
                container,
                {
                    icon: "list-task",
                    title: builder.Locale.get(dashboard_meta_tableMyDailyTasksCategorized('label').replace('Categorized',value)),
                },
                function(card,component){
                    component.body.addClass('p-0');
                    TaskTable(component.body, response.records);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "primary",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Tasks")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "primary",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get(value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "warning",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Today's Tasks")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'category', operator: '=', value: value},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "warning",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Today's "+value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "danger",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Missed Tasks")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
                {key: 'category', operator: '=', value: value},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "danger",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Missed "+value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Completed Tasks")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Completed "+value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Today's Completed Tasks")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("Today's Completed "+value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "primary",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("My Tasks")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "primary",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("My "+value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "warning",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("My Tasks Today")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "warning",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get("My "+value+" Today")).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "danger",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get('My Missed Tasks')).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'due', operator: '<', value: moment().format('YYYY-MM-DD HH:mm:ss')},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "danger",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get('My Missed '+value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'assignedTo', operator: '=', value: USER_ID},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get('My Completed Tasks')).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'category', operator: '=', value: value},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get('My Completed '+value)).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get('My Completed Tasks Today')).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
    $.ajax({
        url: '/api/tasks/count',
        headers: {'X-CSRF-Authorization': CSRF_KEY},
        type: 'POST',dataType: 'json',
        data: {
            conditions: [
                {key: 'isCompleted', operator: '=', value: 1},
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'category', operator: '=', value: value},
                {key: 'isArchived', operator: '=', value: 0},
                {key: 'completedOn', operator: '>', value: moment().format('YYYY-MM-DD')},
            ]
        },
        success: function(response) {
            builder.Component(
                "badge",
                container,
                {
                    icon: "check2-square",
                    color: "success",
                },
                function(badge,component){

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(builder.Locale.get('My Completed '+value+' Today')).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(response.count).appendTo(component.content);
                },
            );
        },
    });
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
