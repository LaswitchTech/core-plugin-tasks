builder.add('renderers', 'task.label', function(value, data, type){
    if(typeof data.task !== 'undefined' || typeof data.label !== 'undefined'){
        return '<div>' + builder.Parser.parse(value) + '</div>';
    }
    return '<div>' + value + '</div>';
})
builder.add('renderers', 'task.progress', function(value, data, type){
    if(typeof data.task !== 'undefined' || typeof data.progress !== 'undefined'){
        var process = (typeof data.task !== 'undefined') ? data.task.process : data.process;
        var color = (process === null || typeof process[value] === "undefined") ? 'success' : process[value].color;
        var icon = (process === null || typeof process[value] === "undefined") ? 'asterisk' : process[value].icon;
        var name = (process === null || typeof process[value] === "undefined") ? builder.Locale.get('New') : process[value].name;
        return '<div><h5><span class="badge text-bg-'+color+'"><i class="me-1 bi bi-'+icon+'"></i>'+name+'</span></h5></div>';
    }
    return '<div>' + value + '</div>';
})
builder.add('renderers', 'task.process', function(value, data, type){
    if(typeof data.task !== 'undefined' || typeof data.process !== 'undefined'){
        for(const [progress, step] of Object.entries(value)){
            for(const [order, task] of Object.entries(step.tasks)){
                if(!task.isCompleted){
                    return '<div><h5><span class="badge text-bg-'+step.color+'"><i class="me-1 bi bi-'+step.icon+'"></i>'+task.name+'</span></h5></div>';
                }
            }
        }
    }
    return '<div>' + value + '</div>';
})
builder.add('renderers', 'task.priority', function(value, data, type){
    if(typeof data.task !== 'undefined' || typeof data.priority !== 'undefined'){
        let color = ['secondary','primary','warning','orange','danger'];
        let name = ['Low','Normal','High','Urgent','Critical'];
        let icon = ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'];
        return '<div><h5><span class="badge text-bg-'+color[value]+'"><i class="me-1 bi bi-'+icon[value]+'"></i>'+builder.Locale.get(name[value])+'</span></h5></div>';
    }
    return '<div>' + value + '</div>';
})
builder.add('renderers', 'task.assignedTo.username', function(value, data, type){
    if(typeof data.task !== 'undefined' || typeof data.assignedTo !== 'undefined'){
        return '<div><img class="avatar" alt="'+value+'" src="/avatar?username='+value+'"><span>'+(value ?? builder.Locale.get('Unassigned'))+'</span></div>';
    }
    return '<div>' + value + '</div>';
})
builder.add('renderers', 'task.due', function(value, data, type){

    // Check for required data
    if(typeof data.task !== 'undefined' || typeof data.due !== 'undefined'){

        // Handle sorting
        // console.log(type);
        if (type === 'sort') {
            return value ? Date.parse(value) : Number.MAX_SAFE_INTEGER;
        }

        // Compare date to now and set background color
        var bg = 'rounded px-2 py-1';
        if(moment(value).isBefore(moment())){
            bg += ' text-bg-danger';
        } else if(moment(value).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')){
            bg += ' text-bg-warning';
        }

        // Setup tooltip and timeago
        setInterval(function(){
            $('[data-type="due"]:not(.rendered)').each(function(){
                const tooltip = new Date($(this).find('time').attr('datetime') ?? new Date().toISOString());
                $(this).attr({
                    'data-bs-toggle': 'tooltip',
                    'data-bs-title': tooltip.toLocaleString(),
                }).addClass('rendered');
                new bootstrap.Tooltip($(this));
                $(this).find('time').timeago();
            });
        },100);

        // Return the formatted due date
        return '<div data-type="due" class="'+bg+'"><i class="bi bi-clock me-1"></i><time datetime="'+value+'"></time></div>';
    }
    return '<div>' + value + '</div>';
})

builder.add('widgets','task', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            data: null,
            callback: {},
        };
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'task' + this._id,
            'class': '',
        });
        this._component.id = this._component.attr('id');
    }

    view(){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                class: {
                    component: 'task-modal',
                },
                icon: "card-checklist",
                title: this._builder.Locale.get("Task"),
                color: 'primary',
                cancel: false,
                submit: false,
                size: "xl",
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {
                                $.ajax({
                                    url: '/api/tasks/fetch?id='+self._properties.data,
                                    type: 'GET',dataType: 'json',
                                    error: function(xhr, status, error) {
                                        console.error('Error fetching data:', error);
                                        modal.hide();
                                        reject(error);
                                    },
                                    success: function(response) {

                                        // Styling
                                        component.body.addClass('p-0');
                                        const priorities = {
                                            color: ['secondary','primary','warning','orange','danger'],
                                            name: ['Low','Normal','High','Urgent','Critical'],
                                            icon: ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'],
                                        }

                                        // Set Properties
                                        self._properties.extensions = response.extensions || [];

                                        // Create the details component
                                        component.details = $(document.createElement('div')).attr({
                                            'class': 'd-flex justify-content-between align-items-center p-3 py-2',
                                        }).appendTo(component.body);

                                        // Create the information section
                                        component.details.info = $(document.createElement('div')).attr({
                                            'class': 'd-flex align-items-start',
                                        }).appendTo(component.details);

                                        // Create the icon
                                        component.details.info.icon = $(document.createElement('div')).attr({
                                            'class': 'task-icon d-none d-lg-flex justify-content-center align-items-center rounded-4 me-3 text-bg-'+priorities.color[response.record.priority],
                                            'style': 'width: 64px; height: 64px;',
                                            'data-task-id': response.record.id,
                                        }).appendTo(component.details.info);
                                        component.details.info.icon.i = $(document.createElement('i')).attr({
                                            'class': 'bi bi-check2-circle fs-3',
                                        }).appendTo(component.details.info.icon);

                                        // Check if the task is completed
                                        if(response.record.isCompleted){
                                            component.details.info.icon.addClass('text-bg-success');
                                            component.details.info.icon.i.attr('class','bi bi-check2-circle fs-3');
                                        }

                                        // Check if the task is archived
                                        if(response.record.isArchived){
                                            component.details.info.icon.addClass('text-bg-dark');
                                            component.details.info.icon.i.attr('class','bi bi-archive fs-3');
                                        }

                                        // Create the meta section
                                        component.details.info.meta = $(document.createElement('div')).appendTo(component.details.info);

                                        // Insert the title
                                        component.details.info.meta.title = $(document.createElement('h4')).attr({
                                            'class': 'fw-light my-1',
                                        }).html(self._builder.Locale.get(response.record.category)).appendTo(component.details.info.meta);
                                        if(typeof response.record.target.vcard !== 'undefined' && response.record.target.vcard !== null){
                                            component.details.info.meta.title.vcard = $(document.createElement('span')).addClass('d-none d-lg-inline-block ms-2').appendTo(component.details.info.meta.title);
                                            component.details.info.meta.title.vcard.append('- ' + response.record.target.vcard.name);
                                            if(typeof response.record.target.vcard.title !== 'undefined' && response.record.target.vcard.title !== null){
                                                component.details.info.meta.title.vcard.append(' - ' + response.record.target.vcard.title);
                                            }
                                        }

                                        // Insert the priority
                                        component.details.info.meta.title.priority = $(document.createElement('span')).attr({
                                            'class': 'badge rounded-pill text-bg-'+priorities.color[response.record.priority]+' ms-2 cursor-pointer',
                                            'style': 'font-size: var(--bs-body-font-size); font-weight: var(--bs-body-font-weight);',
                                            'data-type': 'priority',
                                            'data-task-id': response.record.id,
                                        }).html(self._builder.Locale.get(priorities.name[response.record.priority])).appendTo(component.details.info.meta.title);
                                        component.details.info.meta.title.priority.icon = $(document.createElement('i')).attr({
                                            'class': 'bi bi-'+priorities.icon[response.record.priority]+' me-1',
                                        }).prependTo(component.details.info.meta.title.priority);
                                        component.details.info.meta.title.priority.click(function(e){

                                            // Check if the task is archived or completed
                                            if(!response.record.isArchived && !response.record.isCompleted){
                                                self.priority();
                                            }
                                        });

                                        // Insert the due date
                                        component.details.info.meta.title.due = $(document.createElement('span')).attr({
                                            'class': 'badge rounded-pill text-bg-light ms-2 cursor-pointer',
                                            'style': 'font-size: var(--bs-body-font-size); font-weight: var(--bs-body-font-weight);',
                                            'title': response.record.due ?? new Date().toISOString(),
                                            'data-bs-title': response.record.due ?? new Date().toISOString(),
                                            'data-bs-toggle': 'tooltip',
                                            'data-bs-placement': 'bottom',
                                            'data-type': 'due',
                                            'data-task-id': response.record.id,
                                        }).appendTo(component.details.info.meta.title);
                                        new bootstrap.Tooltip(component.details.info.meta.title.due);
                                        component.details.info.meta.title.due.icon = $(document.createElement('i')).attr({
                                            'class': 'bi bi-clock me-1',
                                        }).prependTo(component.details.info.meta.title.due);
                                        component.details.info.meta.title.due.timeago = $(document.createElement('time')).attr({
                                            'class': 'timeago',
                                            'datetime': response.record.due ?? new Date().toISOString(),
                                        }).appendTo(component.details.info.meta.title.due).timeago();
                                        component.details.info.meta.title.due.click(function(e){

                                            // Check if the task is archived or completed
                                            if(!response.record.isArchived && !response.record.isCompleted){
                                                self.schedule();
                                            }
                                        });

                                        // Insert the subtitle
                                        component.details.info.meta.subtitle = $(document.createElement('div')).attr({
                                            'class': 'd-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-start my-1',
                                        }).appendTo(component.details.info.meta);

                                        // Insert the Assigned to
                                        component.details.info.meta.subtitle.assigned = $(document.createElement('div')).attr({
                                            'class': 'd-flex align-items-center cursor-pointer',
                                            'data-type': 'assigned',
                                            'data-task-id': response.record.id,
                                        }).appendTo(component.details.info.meta.subtitle);
                                        component.details.info.meta.subtitle.assigned.img = $(document.createElement('img')).attr({
                                            'class': 'rounded-circle',
                                            'alt': response.record.assignedTo.username || '',
                                            'src': '/avatar?username=' + ((response.record.assignedTo.username !== null) ? response.record.assignedTo.username : 'Unassigned'),
                                            'style': 'width: 32px; height: 32px;',
                                        }).appendTo(component.details.info.meta.subtitle.assigned);
                                        component.details.info.meta.subtitle.assigned.username = $(document.createElement('span')).attr({
                                            'class': 'ms-2',
                                        }).html(response.record.assignedTo.username || self._builder.Locale.get('Unassigned')).appendTo(component.details.info.meta.subtitle.assigned);
                                        component.details.info.meta.subtitle.assigned.click(function(e){

                                            // Check if the task is archived or completed
                                            if(!response.record.isArchived && !response.record.isCompleted){
                                                self.assign();
                                            }
                                        });

                                        // Insert the Root Target
                                        if(typeof response.record.root.target.vcard !== 'undefined' && response.record.root.target.vcard !== null){
                                            component.details.info.meta.subtitle.root = $(document.createElement('button')).attr({
                                                'class': 'btn btn-link link-dark text-decoration-none',
                                                'type': 'button',
                                            }).text(response.record.root.target.vcard.name).appendTo(component.details.info.meta.subtitle);
                                            component.details.info.meta.subtitle.root.click(function(e){
                                                self._builder.Widget('vcard',{data: response.record.root.target.vcard.id});
                                            });
                                            component.details.info.meta.subtitle.root.icon = $(document.createElement('i')).attr({
                                                'class': 'bi bi-diagram-3 me-1',
                                            }).prependTo(component.details.info.meta.subtitle.root);
                                        }

                                        // Create the controls section
                                        component.details.controls = $(document.createElement('div')).addClass('controls btn-group').appendTo(component.details);

                                        // Insert the target link
                                        component.details.controls.link = $(document.createElement('a')).attr({
                                            'class': 'btn btn-light',
                                            'href': response.record.link || '#',
                                        }).html('<span class="me-2 d-none d-lg-inline-block">'+self._builder.Locale.get('Open target')+'</span><i class="bi bi-chevron-right"></i>').appendTo(component.details.controls);

                                        // Insert the Archive button
                                        component.details.controls.archive = $(document.createElement('button')).attr({
                                            'class': 'btn btn-dark',
                                            'type': 'button',
                                            'data-action': 'archive',
                                            'data-task-id': response.record.id,
                                        }).html('<i class="bi bi-archive"></i>').prependTo(component.details.controls);
                                        component.details.controls.archive.click(function(e){
                                            self.archive();
                                        });

                                        // Create the steps section
                                        component.steps = $(document.createElement('div')).addClass('p-3 py-2 border-bottom').appendTo(component.body);

                                        // Create the tabs section
                                        builder.Component(
                                            "tabs",
                                            component.body,
                                            {
                                                class: {
                                                    navbar: 'nav-pills',
                                                },
                                            },
                                            function(tabs,card){

                                                // Styling
                                                card._component.tools.remove();
                                                card._component.header.heading.addClass('m-0');
                                                card._component.card.addClass('border-0 rounded-top-0');
                                                card._component.body.removeClass('card-body').addClass('row m-0');
                                                tabs._content.addClass('col-12 col-lg-8 p-0 order-2 order-lg-1');
                                                tabs._content.details = $(document.createElement('div')).addClass('col-12 col-lg-4 p-0 order-1 order-lg-2 border-start').appendTo(card._component.body);

                                                // Check if the task is attached to a vcard
                                                if(typeof response.record.target.vcard !== 'undefined' && response.record.target.vcard !== null){

                                                    // Create the vCard section
                                                    card._component.vcard = $(document.createElement('div')).addClass('card vcard border-0 rounded-0').appendTo(tabs._content.details);
                                                    card._component.vcard.body = $(document.createElement('div')).addClass('card-body cursor-pointer').appendTo(card._component.vcard);
                                                    card._component.vcard.footer = $(document.createElement('div')).addClass('card-footer rounded-0 border-bottom d-flex gap-2').appendTo(card._component.vcard);

                                                    // Add vCard information
                                                    card._component.vcard.body.info = $(document.createElement('div')).addClass('d-flex align-items-center gap-3').appendTo(card._component.vcard.body);
                                                    card._component.vcard.body.info.avatar = $(document.createElement('img')).attr({
                                                        'class':'avatar rounded-circle border border-3',
                                                        'src': '/avatar?username=' + (response.record.target.vcard.email ?? 'unknown'),
                                                        'alt': (response.record.target.vcard.name ?? 'Unknown').substring(0,2).toUpperCase(),
                                                        'style': 'width: 64px; height: 64px;',
                                                    }).appendTo(card._component.vcard.body.info);
                                                    card._component.vcard.body.info.container = $(document.createElement('div')).addClass('flex-grow-1').appendTo(card._component.vcard.body.info);
                                                    card._component.vcard.body.info.container.name = $(document.createElement('div')).addClass('d-flex align-items-center gap-2 flex-wrap').text(response.record.target.vcard.name).appendTo(card._component.vcard.body.info.container);
                                                    card._component.vcard.body.info.container.title = $(document.createElement('div')).addClass('small text-secondary').text(response.record.target.vcard.title ?? '').appendTo(card._component.vcard.body.info.container);
                                                    card._component.vcard.body.info.container.dba = $(document.createElement('div')).addClass('small text-secondary').text(response.record.target.vcard.dba ?? '').appendTo(card._component.vcard.body.info.container);
                                                    card._component.vcard.body.info.container.phone = $(document.createElement('div')).addClass('badge text-bg-success mt-1').html((response.record.target.vcard.phone !== null) ? '<i class="bi bi-telephone-fill me-2"></i>'+response.record.target.vcard.phone : '').appendTo(card._component.vcard.body.info.container);
                                                    card._component.vcard.body.badges = $(document.createElement('div')).addClass('mt-2 d-flex flex-wrap gap-2').appendTo(card._component.vcard.body);
                                                    for(const [key, role] of Object.entries(JSON.parse(response.record.target.vcard.role || '[]'))){
                                                        $(document.createElement('span')).addClass('badge text-bg-light border').text(role).appendTo(card._component.vcard.body.badges);
                                                    }

                                                    // Add click event to the card
                                                    card._component.vcard.body.click(function(e){
                                                        if ($(e.target).closest('.controls').length) return;
                                                        self._builder.Widget('vcard',{data: response.record.target.vcard.id});
                                                    });

                                                    // Add Footer Controls
                                                    card._component.vcard.footer.controls = $(document.createElement('div')).addClass('controls btn-group flex-fill').appendTo(card._component.vcard.footer);
                                                    card._component.vcard.footer.controls.call = $(document.createElement('a')).attr({
                                                        'class':'btn btn-success btn-sm flex-fill',
                                                        'type': 'button',
                                                        'href':'tel:' + (response.record.target.vcard.phone ?? ''),
                                                    }).html('<i class="bi-telephone"></i>').appendTo(card._component.vcard.footer.controls);
                                                    card._component.vcard.footer.controls.email = $(document.createElement('a')).attr({
                                                        'class':'btn btn-primary btn-sm flex-fill',
                                                        'href':'mailto:' + (response.record.target.vcard.email ?? ''),
                                                    }).html('<i class="bi-envelope"></i>').appendTo(card._component.vcard.footer.controls);
                                                    card._component.vcard.footer.controls.edit = $(document.createElement('button')).attr({
                                                        'class':'btn btn-warning btn-sm flex-fill',
                                                        'type': 'button',
                                                        'data-action': 'edit',
                                                    }).html('<i class="bi-pencil"></i>').appendTo(card._component.vcard.footer.controls);
                                                    card._component.vcard.footer.controls.edit.click(function(){
                                                        self._builder.Widget('vcard',{mode: 'edit', data: response.record.target.vcard.id});
                                                    });
                                                }

                                                // Initialize the tabs
                                                card.tabs = {};

                                                // Notes
                                                if(self._properties.extensions.includes('notes')){
                                                    tabs.add(
                                                        'notes',
                                                        {
                                                            icon: "stickies",
                                                            label: builder.Locale.get("Notes"),
                                                        },
                                                        function(tab,nav){
                                                            card.tabs.notes = tab;
                                                            self._builder.Widget('notes',tab,{data: response.dependencies.notes ?? {},targetTable: response.record.root.targetTable,targetId: response.record.root.targetId,autoStart: true})
                                                        },
                                                    );
                                                }

                                                // Event
                                                if(self._properties.extensions.includes('event')){

                                                    // Add the Event tab
                                                    tabs.add(
                                                        'event',
                                                        {
                                                            icon: "activity",
                                                            label: builder.Locale.get("Activity"),
                                                        },
                                                        function(tab,nav){
                                                            card.tabs.event = tab;
                                                            self._builder.Widget("events",tab,{data: response.dependencies.event ?? {},targetTable: 'tasks',targetId: response.record.id});
                                                        },
                                                    );
                                                }

                                                // Task - Process
                                                if(self._properties.extensions.includes('process')){
                                                    builder.Widget(
                                                        "processTree",
                                                        tabs._content.details,
                                                        {
                                                            class: {
                                                                steps: 'border-bottom p-3 py-2',
                                                                pagination: 'p-3 py-2 btn-group w-100',
                                                            },
                                                            data: response.record.id,
                                                        },
                                                        function(widget){
                                                            widget.controls().appendTo(component.steps)
                                                        }
                                                    );
                                                }

                                                // Relationship
                                                if(self._properties.extensions.includes('relationship')){

                                                    // Create the Relationship widget
                                                    self._builder.Widget("related",tabs._content.details,{data: response.dependencies.relationship ?? {},targetTable: 'tasks',targetId: response.record.id});
                                                }
                                            },
                                        );

                                        // Resolve the promise
                                        resolve();
                                    }
                                });
                            } catch(e) { reject(e); }
                        });
                    },
                },
            },
            function(modal,component){

                // Show the modal
                modal.show();
            },
        );
    }

    assign(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "person-plus",
                title: this._builder.Locale.get("Assign/unassign user"),
                color: 'warning',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {

                                // Retrieve members
                                $.ajax({
                                    url: '/api/auth/users',
                                    type: 'GET',dataType: 'json',
                                    error: function(xhr, status, error) {
                                        console.error('Error fetching data:', error);
                                        modal.hide();
                                        reject(error);
                                    },
                                    success: function(response) {
                                        const members = response.records;
                                        const options = [];
                                        for(const [id, member] of Object.entries(members)){
                                            options.push({id: id, text: member.username});
                                        }

                                        // Retrieve task data
                                        $.ajax({
                                            url: '/api/tasks/fetch?id='+self._properties.data,
                                            type: 'GET',dataType: 'json',
                                            error: function(xhr, status, error) {
                                                console.error('Error fetching data:', error);
                                                modal.hide();
                                                reject(error);
                                            },
                                            success: function(response) {

                                                // Check if the task is archived or completed
                                                if(response.record.isArchived || response.record.isCompleted){
                                                    // Log the error and reject the promise
                                                    console.error('Task is archived('+response.record.isArchived+') or completed('+response.record.isCompleted+').');
                                                    modal.hide();
                                                    reject('Task is archived('+response.record.isArchived+') or completed('+response.record.isCompleted+').');
                                                }

                                                // Create the Form
                                                self._builder.Utility(
                                                    'form',
                                                    component.body,
                                                    {
                                                        callback: {
                                                            val: function(values){
                                                                if(response.record.assignedTo.username){
                                                                    values = {assignedTo: null}
                                                                }
                                                                return values;
                                                            },
                                                            submit: function(form){

                                                                // Show the modal spinner
                                                                modal.spinner(true);

                                                                // AJAX Request
                                                                $.ajax({
                                                                    url: '/api/tasks/update?id='+self._properties.data,
                                                                    headers: {'X-CSRF-Authorization': CSRF_KEY},
                                                                    type: 'POST',dataType: 'json',
                                                                    data: form.val(),
                                                                    success: function(response) {

                                                                        // Update the task assigned
                                                                        $('[data-type="assigned"][data-task-id="'+self._properties.data+'"]').each(function(){

                                                                            // Update the assigned username
                                                                            $(this).find('span').text(response.record.assignedTo.username || self._builder.Locale.get('Unassigned'));

                                                                            // Update the assigned image
                                                                            $(this).find('img').attr({
                                                                                'alt': response.record.assignedTo.username || '',
                                                                                'src': '/avatar?username=' + ((response.record.assignedTo.username !== null) ? response.record.assignedTo.username : 'Unassigned'),
                                                                            });
                                                                        });

                                                                        // Check if a callback is provided
                                                                        if (typeof callback === 'function') {
                                                                            callback(response);
                                                                        }

                                                                        // Close the modal
                                                                        modal.hide();
                                                                    }
                                                                });
                                                            },
                                                        }
                                                    },
                                                    function(form,component){

                                                        // Add event listener on the modal submit button
                                                        parent.dialog.content.footer.submit.click(function(e){
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            form.submit();
                                                        });

                                                        // Check if the task is assigned
                                                        if(response.record.assignedTo.username){

                                                            // Insert a warning message
                                                            $(document.createElement('div')).addClass('p-3').text('You are about to unassign the user from this task. Are you sure you want to proceed?').appendTo(parent.dialog.content.body);
                                                        } else {

                                                            // assignedTo
                                                            form.add(
                                                                'select2',
                                                                {
                                                                    name: 'assignedTo',
                                                                    label: self._builder.Locale.get('User'),
                                                                    placeholder: self._builder.Locale.get('Select a user'),
                                                                    class: {
                                                                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                                                                    },
                                                                    options: options,
                                                                }
                                                            );
                                                        }

                                                        // Resolve the promise
                                                        resolve();
                                                    },
                                                );
                                            },
                                        });
                                    },
                                });
                            } catch(e) {

                                // Log the error and reject the promise
                                console.error('Error in assign modal:', e);
                                modal.hide();
                                reject(e);
                            }
                        });
                    },
                },
            },
            function(modal,component){

                // Styling
                component.body.addClass('p-0');

                // Show the modal
                modal.show();
            },
        );
    }

    priority(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "exclamation-triangle",
                title: this._builder.Locale.get("Change priority"),
                color: 'warning',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Set Priorities
                        const priorities = {
                            color: ['secondary','primary','warning','orange','danger'],
                            name: ['Low','Normal','High','Urgent','Critical'],
                            icon: ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'],
                        }

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {
                                $.ajax({
                                    url: '/api/tasks/fetch?id='+self._properties.data,
                                    type: 'GET',dataType: 'json',
                                    error: function(xhr, status, error) {
                                        console.error('Error fetching data:', error);
                                        modal.hide();
                                        reject(error);
                                    },
                                    success: function(response) {

                                        // Check if the task is archived or completed
                                        if(response.record.isArchived || response.record.isCompleted){
                                            // Log the error and reject the promise
                                            console.error('Task is archived('+response.record.isArchived+') or completed('+response.record.isCompleted+').');
                                            modal.hide();
                                            reject('Task is archived('+response.record.isArchived+') or completed('+response.record.isCompleted+').');
                                        }

                                        // Create the Form
                                        self._builder.Utility(
                                            'form',
                                            component.body,
                                            {
                                                callback: {
                                                    submit: function(form){

                                                        // Show the modal spinner
                                                        modal.spinner(true);

                                                        // AJAX Request
                                                        $.ajax({
                                                            url: '/api/tasks/update?id='+self._properties.data,
                                                            headers: {'X-CSRF-Authorization': CSRF_KEY},
                                                            type: 'POST',dataType: 'json',
                                                            data: form.val(),
                                                            success: function(response) {

                                                                // Update the task priority
                                                                $('[data-type="priority"][data-task-id="'+self._properties.data+'"]').each(function(){

                                                                    // Remove all classes text-bg-*
                                                                    $(this).removeClass(function (index, className) {
                                                                        return (className.match(/(^|\s)text-bg-\S+/g) || []).join(' ');
                                                                    });

                                                                    // Add the new class
                                                                    $(this).addClass('text-bg-'+priorities.color[response.record.priority]);
                                                                    $(this).text(self._builder.Locale.get(priorities.name[response.record.priority]));
                                                                    $(this).prepend('<i class="bi bi-'+priorities.icon[response.record.priority]+' me-1"></i>');
                                                                });

                                                                // Check if a callback is provided
                                                                if (typeof callback === 'function') {
                                                                    callback(response);
                                                                }

                                                                // Close the modal
                                                                modal.hide();
                                                            }
                                                        });
                                                    },
                                                }
                                            },
                                            function(form,component){

                                                // Add event listener on the modal submit button
                                                parent.dialog.content.footer.submit.click(function(e){
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    form.submit();
                                                });

                                                // priority
                                                form.add(
                                                    'select',
                                                    {
                                                        name: 'priority',
                                                        label: self._builder.Locale.get('Level'),
                                                        placeholder: self._builder.Locale.get('Select a level'),
                                                        class: {
                                                            component: 'bg-gray-200 p-3 py-2 rounded-0',
                                                        },
                                                        options: [
                                                            {id: 0, text: self._builder.Locale.get(priorities.name[0])},
                                                            {id: 1, text: self._builder.Locale.get(priorities.name[1])},
                                                            {id: 2, text: self._builder.Locale.get(priorities.name[2])},
                                                            {id: 3, text: self._builder.Locale.get(priorities.name[3])},
                                                            {id: 4, text: self._builder.Locale.get(priorities.name[4])},
                                                        ],
                                                        value: response.record.priority,
                                                    }
                                                );

                                                // Resolve the promise
                                                resolve();
                                            },
                                        );
                                    },
                                });
                            } catch(e) {

                                // Log the error and reject the promise
                                console.error('Error in priority modal:', e);
                                modal.hide();
                                reject(e);
                            }
                        });
                    },
                },
            },
            function(modal,component){

                // Styling
                component.body.addClass('p-0');

                // Show the modal
                modal.show();
            },
        );
    }

    schedule(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "calendar",
                title: this._builder.Locale.get("Reschedule task"),
                color: 'warning',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {
                                $.ajax({
                                    url: '/api/tasks/fetch?id='+self._properties.data,
                                    type: 'GET',dataType: 'json',
                                    error: function(xhr, status, error) {
                                        console.error('Error fetching data:', error);
                                        modal.hide();
                                        reject(error);
                                    },
                                    success: function(response) {

                                        // Check if the task is archived or completed
                                        if(response.record.isArchived || response.record.isCompleted){
                                            // Log the error and reject the promise
                                            console.error('Task is archived('+response.record.isArchived+') or completed('+response.record.isCompleted+').');
                                            modal.hide();
                                            reject('Task is archived('+response.record.isArchived+') or completed('+response.record.isCompleted+').');
                                        }

                                        // Create the Form
                                        self._builder.Utility(
                                            'form',
                                            component.body,
                                            {
                                                callback: {
                                                    val: function(values){

                                                        // Set the default values
                                                        values.due = new Date().toISOString().slice(0, 19).replace('T', ' ');

                                                        // Set the date and time
                                                        values.date = values.date || new Date().toISOString().slice(0, 10);
                                                        values.time = values.time || new Date().toISOString().slice(11, 16);

                                                        // Combine date and time into due
                                                        values.due = values.date + ' ' + values.time;

                                                        // Remove date and time from values
                                                        delete values.date;
                                                        delete values.time;

                                                        // Return the values
                                                        return values;
                                                    },
                                                    submit: function(form){

                                                        // Show the modal spinner
                                                        modal.spinner(true);

                                                        // AJAX Request
                                                        $.ajax({
                                                            url: '/api/tasks/update?id='+self._properties.data,
                                                            headers: {'X-CSRF-Authorization': CSRF_KEY},
                                                            type: 'POST',dataType: 'json',
                                                            data: form.val(),
                                                            success: function(response) {

                                                                // Update the task due date
                                                                $('[data-type="due"][data-task-id="'+self._properties.data+'"]').each(function(){

                                                                    // Update the title and datetime attributes
                                                                    $(this).attr({
                                                                        'title': response.record.due ?? new Date().toISOString(),
                                                                        'data-bs-title': response.record.due ?? new Date().toISOString(),
                                                                    }).find('time').attr({
                                                                        'datetime': response.record.due ?? new Date().toISOString(),
                                                                    }).text('');

                                                                    // Re-initialize the tooltip
                                                                    new bootstrap.Tooltip($(this));

                                                                    // Re-initialize the timeago
                                                                    $(this).find('time').timeago('update', response.record.due ?? new Date().toISOString());
                                                                });

                                                                // Check if a callback is provided
                                                                if (typeof callback === 'function') {
                                                                    callback(response);
                                                                }

                                                                // Close the modal
                                                                modal.hide();
                                                            }
                                                        });
                                                    },
                                                }
                                            },
                                            function(form,component){

                                                // Add event listener on the modal submit button
                                                parent.dialog.content.footer.submit.click(function(e){
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    form.submit();
                                                });

                                                // date
                                                form.add(
                                                    'date',
                                                    {
                                                        name: 'date',
                                                        label: self._builder.Locale.get('Date'),
                                                        placeholder: self._builder.Locale.get('Enter a date'),
                                                        class: {
                                                            component: 'bg-gray-200 p-3 py-2 pb-0 rounded-0',
                                                        },
                                                        value: response.record.due.split(' ')[0] || '',
                                                    }
                                                );

                                                // time
                                                form.add(
                                                    'time',
                                                    {
                                                        name: 'time',
                                                        label: self._builder.Locale.get('Time'),
                                                        placeholder: self._builder.Locale.get('Enter a time'),
                                                        class: {
                                                            component: 'bg-gray-200 p-3 py-2 rounded-0',
                                                        },
                                                        value: response.record.due.split(' ')[1] || '',
                                                    }
                                                );

                                                // Resolve the promise
                                                resolve();
                                            },
                                        );
                                    },
                                });
                            } catch(e) {

                                // Log the error and reject the promise
                                console.error('Error in priority modal:', e);
                                modal.hide();
                                reject(e);
                            }
                        });
                    },
                },
            },
            function(modal,component){

                // Styling
                component.body.addClass('p-0');

                // Show the modal
                modal.show();
            },
        );
    }

    archive(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "archive",
                title: this._builder.Locale.get("Are you sure?"),
                body: this._builder.Locale.get("You are about to archive this task. Are you sure you want to continue?"),
                color: 'dark',
                callback: {
                    submit: function(element,modal){

                        // Show the modal spinner
                        modal.spinner(true);

                        // AJAX Request - Archive the task
                        $.ajax({
                            url: '/api/tasks/archive?id='+self._properties.data,
                            type: 'GET',dataType: 'json',
                            success: function(response) {

                                // Update the task UI
                                $('[data-task-id="'+self._properties.data+'"].task-icon').each(function(){
                                    $(this).removeClass(function (index, className) {
                                        return (className.match(/(^|\s)text-bg-\S+/g) || []).join(' ');
                                    });
                                    $(this).addClass('text-bg-dark');
                                    $(this).find('i').attr('class','bi bi-archive fs-3');
                                });
                                $('[data-task-id="'+self._properties.data+'"][data-action="archive"]').remove();

                                // Check if a callback is provided
                                if (typeof callback === 'function') {
                                    callback(response);
                                }

                                // Close the modal
                                modal.hide();
                            }
                        });
                    },
                },
            },
            function(modal,component){

                // Show the modal
                modal.show();
            },
        );
    }
});
builder.add('widgets','tasks', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            data: null,
            conditions: [],
            interval: 10000,
            autoStart: false,
            callback: {},
        };
        this._datatable = null;
        this._interval = null;
        this._count = 0;
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'tasks' + this._id,
            'class': 'tasks-feed',
        });
        this._component.id = this._component.attr('id');

        // Add class to the component
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Create the Table
        this._builder.Component(
            'datatable',
            this._component,
            this._properties,
            function(datatable, component){
                console.log('Tasks datatable loaded', datatable, component);

                // Set _datatable
                self.datatable(datatable);

                // Add Records
                self.load(self._properties.data);

                // Check if autoStart is enabled
                if(self._properties.autoStart){

                    // Start
                    setTimeout(function(){
                        self.start();
                    }, self._properties.interval);
                }
            },
        );
    }

    config(options){

        // Set Self
        const self = this;

        // Execute parent config
        super.config(options);

        // Table Properties
        this._properties.class.buttons = 'tasks-controls';
        this._properties.class.table = 'tasks-table';
        this._properties.class.footer = 'tasks-footer';
        this._properties.standardSearch = true;
        this._properties.advancedSearch = false;
        this._properties.showButtonsLabel = false;

        // Table Actions
        this._properties.actions = {
            details:{
                label:'Details',
                icon:'eye',
                action:function(event, table, dt, node, row, data){
                    self._builder.Widget('task',{data: data.id}).view();
                }
            },
            archive:{
                label:'Archive',
                icon:'archive',
                action:function(event, table, dt, node, row, data){
                    self._builder.Widget('task',{data: data.id}).archive(function(response){
                        self.datatable().delete(row);
                    });
                }
            },
        };

        // Datatable Properties
        this._properties.datatable = {};

        // Responsive
        this._properties.datatable.responsive = {
            breakpoints: [
                { name: 'xl', width: Infinity },
                { name: 'lg', width: 1400 },
                { name: 'md', width: 992 },
                { name: 'sm', width: 768 },
                { name: 'xs', width: 576 },
                { name: 'xxs', width: 0 }
            ]
        };

        // Set Buttons
        this._properties.datatable.buttons = [];

        // Set Column Definitions
        this._properties.datatable.columnDefs = [
            {
                targets: 0,
                visible: false,
                title: builder.Locale.get('ID'),
                name: 'id',
                data: 'id',
            },
            {
                targets: 1,
                visible: false,
                title: builder.Locale.get('Category'),
                className: 'min-md',
                name: 'category',
                data: 'category',
                defaultContent: '',
                responsivePriority: 100,
            },
            {
                targets: 2,
                visible: true,
                title: builder.Locale.get('Label'),
                className: 'all',
                name: 'label',
                data: 'label',
                width: '50%',
                defaultContent: '',
                responsivePriority: 1,
                render: function(data, type, row, meta) {
                    return self._builder.Render('task.label', data, row, type);
                },
            },
            {
                targets: 3,
                visible: false,
                title: builder.Locale.get('Status'),
                className: 'min-md',
                name: 'status',
                data: 'progress',
                defaultContent: '',
                responsivePriority: 200,
                render: function(data, type, row, meta) {
                    return self._builder.Render('task.progress', data, row, type);
                },
            },
            {
                targets: 4,
                visible: true,
                title: builder.Locale.get('Task'),
                className: 'min-md',
                name: 'task',
                data: 'process',
                defaultContent: '',
                responsivePriority: 10,
                render: function(data, type, row, meta) {
                    return self._builder.Render('task.process', data, row, type);
                },
            },
            {
                targets: 5,
                visible: true,
                title: builder.Locale.get('Priority'),
                className: 'min-md',
                name: 'priority',
                data: 'priority',
                defaultContent: 0,
                responsivePriority: 20,
                render: function(data, type, row, meta) {
                    return self._builder.Render('task.priority', data, row, type);
                },
            },
            {
                targets: 6,
                visible: true,
                title: builder.Locale.get('Assigned To'),
                className: 'min-md',
                name: 'assignedTo',
                data: 'assignedTo.username',
                defaultContent: '',
                responsivePriority: 30,
                render: function(data, type, row, meta) {
                    return self._builder.Render('task.assignedTo.username', data, row, type);
                },
            },
            {
                targets: 7,
                visible: true,
                title: builder.Locale.get('Due'),
                className: 'min-md',
                name: 'due',
                data: 'due',
                defaultContent: '',
                responsivePriority: 40,
                render: function(data, type, row, meta) {
                    return self._builder.Render('task.due', data, row, type);
                },
            },
        ];

        // Set Column Order
        this._properties.datatable.order = [[7, 'asc']];

        // Setup Placeholder
        this._properties.datatable.initComplete = function(param) {
            $(param.nTableWrapper).find('.dataTables_filter input').attr({
                'placeholder': builder.Locale.get('Search...'),
            });
        };

        // Add Row Double Click Event
        this._properties.dblclick = function(event, table, dt, node, data){
            self._builder.Widget('task',{data: data.id}).view();
        };
    }

    datatable(datatable = null){
        if(datatable){
            this._datatable = datatable;
        }
        return this._datatable;
    }

    load(records = null){

        // Set Self
        const self = this;

        // Check if records are provided
        if(records !== null && Object.entries(records).length > 0){

            // Loop through the records
            for(const [key, record] of Object.entries(records)){
                this.add(record);
            }
            return this;
        }

        // Retrieve Followups
        $.ajax({
            url: '/api/tasks/fetchAll',
            headers: {'X-CSRF-Authorization': CSRF_KEY},
            type: 'POST',dataType: 'json',
            data: {
                conditions: this._properties.conditions,
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data:', error);
            },
            success: function(response) {

                // Add Feed Posts
                for(const [key, record] of Object.entries(response.records)){
                    self.add(record);
                }
            }
        });

        return this;
    }

    start(){

        // Set Self
        const self = this;

        // Check if the interval is already set
        if(this._interval){
            console.warn('Interval is already set, stopping the previous one.');
            clearInterval(this._interval);
        }

        // Set the interval to check for changes
        this._interval = setInterval(function(){
            self.load();
        }, this._properties.interval);
    }

    stop(){
        // Check if the interval is set
        if(this._interval){
            clearInterval(this._interval);
            this._interval = null;
        } else {
            console.warn('No interval is currently set.');
        }
    }

    add(record){

        // Add Record
        this.datatable().add(record);

        return this;
    }
});
builder.add('widgets','widgetTasks', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            data: null,
            title: null,
            conditions: [],
            interval: 10000,
            autoStart: false,
            callback: {},
        };
        this._widget = null;
        this._card = null;
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'tasks' + this._id,
            'class': 'widgetTasks',
        });
        this._component.id = this._component.attr('id');

        // Add class to the component
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Create the Card
        this._builder.Component(
            'card',
            this._component,
            {
                icon: "list-task",
                title: this._properties.title,
            },
            function(card, component){

                // Set _card
                self.card(card);

                // Styling
                component.body.addClass('p-0');

                // Create the Widget
                self._builder.Widget(
                    'tasks',
                    self.card()._component.body,
                    self._properties,
                    function(widget, component){

                        // Set _widget
                        self.widget(widget);
                    },
                );
            },
        );
    }

    widget(widget = null){
        if(widget){
            this._widget = widget;
        }
        return this._widget;
    }

    card(card = null){
        if(card){
            this._card = card;
        }
        return this._card;
    }
});
