const tasksDefinition = [
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
            return builder.Render('task.label', data, row, type);
        },
    },
    {
        targets: 3,
        visible: false,
        title: builder.Locale.get('Name'),
        className: 'min-md',
        name: 'name',
        data: 'root.target.vcard.name',
        defaultContent: '',
        responsivePriority: 110,
    },
    {
        targets: 4,
        visible: false,
        title: builder.Locale.get('Address'),
        className: 'min-md',
        name: 'address',
        data: 'root.target.vcard.address',
        defaultContent: '',
        responsivePriority: 120,
    },
    {
        targets: 5,
        visible: false,
        title: builder.Locale.get('City'),
        className: 'min-md',
        name: 'city',
        data: 'root.target.vcard.city',
        defaultContent: '',
        responsivePriority: 130,
    },
    {
        targets: 6,
        visible: false,
        title: builder.Locale.get('State'),
        className: 'min-md',
        name: 'state',
        data: 'root.target.vcard.state',
        defaultContent: '',
        responsivePriority: 140,
    },
    {
        targets: 7,
        visible: false,
        title: builder.Locale.get('Country'),
        className: 'min-md',
        name: 'country',
        data: 'root.target.vcard.country',
        defaultContent: '',
        responsivePriority: 150,
    },
    {
        targets: 8,
        visible: false,
        title: builder.Locale.get('Phone'),
        className: 'min-md',
        name: 'phone',
        data: 'target.vcard.phone',
        defaultContent: '',
        responsivePriority: 160,
    },
    {
        targets: 9,
        visible: false,
        title: builder.Locale.get('Mobile'),
        className: 'min-md',
        name: 'mobile',
        data: 'target.vcard.mobile',
        defaultContent: '',
        responsivePriority: 170,
    },
    {
        targets: 10,
        visible: false,
        title: builder.Locale.get('Tollfree'),
        className: 'min-md',
        name: 'tollfree',
        data: 'target.vcard.tollfree',
        defaultContent: '',
        responsivePriority: 180,
    },
    {
        targets: 11,
        visible: false,
        title: builder.Locale.get('Status'),
        className: 'min-md',
        name: 'status',
        data: 'progress',
        defaultContent: '',
        responsivePriority: 200,
        render: function(data, type, row, meta) {
            return builder.Render('task.progress', data, row, type);
        },
    },
    {
        targets: 12,
        visible: true,
        title: builder.Locale.get('Task'),
        className: 'min-md',
        name: 'task',
        data: 'process',
        defaultContent: '',
        responsivePriority: 10,
        render: function(data, type, row, meta) {
            return builder.Render('task.process', data, row, type);
        },
    },
    {
        targets: 13,
        visible: true,
        title: builder.Locale.get('Priority'),
        className: 'min-md',
        name: 'priority',
        data: 'priority',
        defaultContent: 0,
        responsivePriority: 20,
        render: function(data, type, row, meta) {
            return builder.Render('task.priority', data, row, type);
        },
    },
    {
        targets: 14,
        visible: true,
        title: builder.Locale.get('Assigned To'),
        className: 'min-md',
        name: 'assignedTo',
        data: 'assignedTo.username',
        defaultContent: '',
        responsivePriority: 30,
        render: function(data, type, row, meta) {
            return builder.Render('task.assignedTo.username', data, row, type);
        },
    },
    {
        targets: 15,
        visible: true,
        title: builder.Locale.get('Due'),
        className: 'min-md',
        name: 'due',
        data: 'due',
        defaultContent: '',
        responsivePriority: 40,
        render: function(data, type, row, meta) {
            return builder.Render('task.due', data, row, type);
        },
    },
];

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
    var current = {};
    var last = {};
    if(typeof data.task !== 'undefined' || typeof data.process !== 'undefined'){
        for(const [progress, step] of Object.entries(value)){
            for(const [order, task] of Object.entries(step.tasks)){
                last.step = step;
                last.task = task;
                if(!task.isCompleted){
                    if(typeof current.step === 'undefined' || typeof current.task === 'undefined'){
                        current.step = step;
                        current.task = task;
                    }
                }
            }
        }
    }
    if(typeof current.step !== 'undefined' && typeof current.task !== 'undefined'){
        return '<div><h5><span class="badge text-bg-'+current.step.color+'"><i class="me-1 bi bi-'+current.step.icon+'"></i>'+current.task.name+'</span></h5></div>';
    }
    if(typeof last.step !== 'undefined' && typeof last.task !== 'undefined'){
        return '<div><h5><span class="badge text-bg-'+last.step.color+'"><i class="me-1 bi bi-'+last.step.icon+'"></i>'+last.task.name+'</span></h5></div>';
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

    // Handle sorting
    if (type === 'sort') {
        return value ? Date.parse(value) : Number.MAX_SAFE_INTEGER;
    }

    // Check if value is null
    if(value === null || value === ''){
        return '';
    }

    // Check for required data
    if(typeof data.task !== 'undefined' || typeof data.due !== 'undefined'){

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
            unassign: true,
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
                                API.endpoint('/tasks/fetch?id='+self._properties.data).execute(function(response){

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
                                                    'src': '/avatar?id=' + response.record.target.vcard.id,
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
                                },function(xhr, status, error){
                                    modal.hide();
                                    reject(error);
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
                                API.endpoint('/auth/users').execute(function(response){

                                    const members = response.records;
                                    const options = [];
                                    for(const [id, member] of Object.entries(members)){
                                        options.push({id: id, text: member.username});
                                    }

                                    // Retrieve task data
                                    API.endpoint('/tasks/fetch?id='+self._properties.data).execute(function(response){

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
                                                        API.endpoint('/tasks/update?id='+self._properties.data).data(form.val()).execute(function(response){

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
                                                        },function(xhr, status, error){
                                                            modal.hide();
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

                                                    // Check if unassign is allowed
                                                    if(self._properties.unassign){

                                                        // Insert a warning message
                                                        $(document.createElement('div')).addClass('p-3').text('You are about to unassign the user from this task. Are you sure you want to proceed?').appendTo(parent.dialog.content.body);
                                                    } else {

                                                        // Check if a callback is provided
                                                        if (typeof callback === 'function') {
                                                            callback(response);
                                                        }

                                                        // Close the modal
                                                        modal.hide();
                                                    }
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
                                    },function(xhr, status, error){
                                        modal.hide();
                                        reject(error);
                                    });
                                },function(xhr, status, error){
                                    modal.hide();
                                    reject(error);
                                });
                            } catch(e) {

                                // Log the error and reject the promise
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
                                API.endpoint('/tasks/fetch?id='+self._properties.data).execute(function(response){

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
                                                    API.endpoint('/tasks/update?id='+self._properties.data).data(form.val()).execute(function(response){

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
                                                    },function(xhr, status, error){
                                                        modal.hide();
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
                                },function(xhr, status, error){
                                    modal.hide();
                                    reject(error);
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
                color: 'teal',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {
                                API.endpoint('/tasks/fetch?id='+self._properties.data).execute(function(response){

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
                                                    API.endpoint('/tasks/update?id='+self._properties.data).data(form.val()).execute(function(response){

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
                                                    },function(xhr, status, error){
                                                        modal.hide();
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
                                },function(xhr, status, error){
                                    modal.hide();
                                    reject(error);
                                });
                            } catch(e) {

                                // Log the error and reject the promise
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
                        API.endpoint('/tasks/archive?id='+self._properties.data).execute(function(response){

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
                        },function(xhr, status, error){
                            modal.hide();
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
            render: true,
            interval: 10000,
            autoStart: false,
            callback: {},
        };
        this._datatable = null;
        this._interval = null;
        this._count = 0;
        this._color = ['secondary','primary','warning','orange','danger'];
        this._name = ['Low','Normal','High','Urgent','Critical'];
        this._icon = ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'];
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

        // Check if render is disabled
        if(!this._properties.render){ return; }

        // Create the Table
        this._builder.Component(
            'datatable',
            this._component,
            this._properties,
            function(datatable, component){

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
        this._properties.exportTools = false;
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
        this._properties.datatable.columnDefs = [];
        for(const [key, definition] of Object.entries(tasksDefinition)){
            this._properties.datatable.columnDefs.push(definition);
        }

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

        // Create a loader function
        const loader = function(records){
            for(const [key, record] of Object.entries(records)){
                self.add(record);
            }
            self.datatable().rows().every(function(rowIdx, tableLoop, rowLoop){
                if(typeof records[this.data()['id']] === 'undefined'){
                    self.datatable().row(rowIdx).remove();
                }
            });
            return self;
        };

        // Check if records are provided
        if(records !== null && Object.entries(records).length > 0){
            return loader(records);
        }

        // Retrieve Records
        if(Array.isArray(this._properties.conditions)){
            API.endpoint('/tasks/fetchAll').data({conditions: self._properties.conditions}).execute(function(response){
                return loader(response.records);
            });
        } else {
            API.endpoint('/tasks/fetchAll').execute(function(response){
                return loader(response.records);
            });
        }

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

    priority(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No task data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "exclamation-triangle",
                title: this._builder.Locale.get("Change priority"),
                color: 'primary',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {

                                // Create the Form
                                self._builder.Utility(
                                    'form',
                                    component.body,
                                    {
                                        callback: {
                                            submit: function(form){

                                                // Show the modal spinner
                                                modal.spinner(true);

                                                // Create an array to hold promises
                                                const promises = [];

                                                // Create a promise for each record
                                                for(const [key, record] of Object.entries(self._properties.data)){
                                                    promises.push(function(bar){
                                                        return new Promise((res, rej) => {

                                                            // AJAX Request
                                                            API.endpoint('/tasks/update?id='+record.id).data(form.val()).execute(function(response){
                                                                bar.removeClass('text-bg-danger text-bg-success').addClass('text-bg-primary');
                                                                res();
                                                            },function(xhr, status, error){
                                                                bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                                rej(error);
                                                            });
                                                        });
                                                    });
                                                }

                                                // Execute the promises with loader
                                                self._loader('primary', promises, function(){

                                                    // Check if a callback is provided
                                                    if (typeof callback === 'function') {
                                                        callback(self._properties.data);
                                                    }

                                                    // Close the modal
                                                    modal.hide();
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

                                        // assignedTo
                                        form.add(
                                            'select2',
                                            {
                                                name: 'priority',
                                                label: self._builder.Locale.get('Level'),
                                                placeholder: self._builder.Locale.get('Select a level'),
                                                class: {
                                                    component: 'bg-gray-200 p-3 py-2 rounded-0',
                                                },
                                                options: [
                                                    {id: 0, text: self._builder.Locale.get(self._name[0])},
                                                    {id: 1, text: self._builder.Locale.get(self._name[1])},
                                                    {id: 2, text: self._builder.Locale.get(self._name[2])},
                                                    {id: 3, text: self._builder.Locale.get(self._name[3])},
                                                    {id: 4, text: self._builder.Locale.get(self._name[4])},
                                                ],
                                            }
                                        );

                                        // Resolve the promise
                                        resolve();
                                    },
                                );
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

    schedule(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No task data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "calendar",
                title: this._builder.Locale.get("Reschedule task(s)"),
                color: 'teal',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {

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

                                                // Create an array to hold promises
                                                const promises = [];

                                                // Create a promise for each record
                                                for(const [key, record] of Object.entries(self._properties.data)){
                                                    promises.push(function(bar){
                                                        return new Promise((res, rej) => {

                                                            // AJAX Request
                                                            API.endpoint('/tasks/update?id='+record.id).data(form.val()).execute(function(response){
                                                                bar.removeClass('text-bg-danger text-bg-success').addClass('text-bg-primary');
                                                                res();
                                                            },function(xhr, status, error){
                                                                bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                                rej(error);
                                                            });
                                                        });
                                                    });
                                                }

                                                // Execute the promises with loader
                                                self._loader('teal', promises, function(){

                                                    // Check if a callback is provided
                                                    if (typeof callback === 'function') {
                                                        callback(self._properties.data);
                                                    }

                                                    // Close the modal
                                                    modal.hide();
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
                                                value: new Date().toISOString().slice(0, 10),
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
                                                value: new Date().toISOString().slice(11, 16),
                                            }
                                        );

                                        // Resolve the promise
                                        resolve();
                                    },
                                );
                            } catch(e) {

                                // Log the error and reject the promise
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

    assign(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No task data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "person-plus",
                title: this._builder.Locale.get("Assign"),
                color: 'warning',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {

                                // Retrieve members
                                API.endpoint('/auth/users').execute(function(response){
                                    const members = response.records;
                                    const options = [];
                                    for(const [id, member] of Object.entries(members)){
                                        options.push({id: id, text: member.username});
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

                                                    // Create an array to hold promises
                                                    const promises = [];

                                                    // Create a promise for each record
                                                    for(const [key, record] of Object.entries(self._properties.data)){
                                                        promises.push(function(bar){
                                                            return new Promise((res, rej) => {

                                                                // AJAX Request
                                                                API.endpoint('/tasks/update?id='+record.id).data(form.val()).execute(function(response){
                                                                    bar.removeClass('text-bg-danger text-bg-success').addClass('text-bg-primary');
                                                                    res();
                                                                },function(xhr, status, error){
                                                                    bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                                    rej(error);
                                                                });
                                                            });
                                                        });
                                                    }

                                                    // Execute the promises with loader
                                                    self._loader('warning', promises, function(){

                                                        // Check if a callback is provided
                                                        if (typeof callback === 'function') {
                                                            callback(self._properties.data);
                                                        }

                                                        // Close the modal
                                                        modal.hide();
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

                                            // Resolve the promise
                                            resolve();
                                        },
                                    );
                                },function(xhr, status, error){
                                    modal.hide();
                                    reject(error);
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

    unassign(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No task data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "person-x",
                title: this._builder.Locale.get("Unassign"),
                body: this._builder.Locale.get("You are about to unassign the selected task(s). Are you sure you want to continue?"),
                color: 'warning',
                callback: {
                    submit: function(component, modal){

                        // Show the modal spinner
                        modal.spinner(true);

                        // Create an array to hold promises
                        const promises = [];

                        // Create a promise for each record
                        for(const [key, record] of Object.entries(self._properties.data)){
                            promises.push(function(bar){
                                return new Promise((res, rej) => {

                                    // AJAX Request
                                    API.endpoint('/tasks/update?id='+record.id).data({assignedTo:null}).execute(function(response){
                                        bar.removeClass('text-bg-danger text-bg-success').addClass('text-bg-primary');
                                        res();
                                    },function(xhr, status, error){
                                        bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                        rej(error);
                                    });
                                });
                            });
                        }

                        // Execute the promises with loader
                        self._loader('warning', promises, function(){

                            // Check if a callback is provided
                            if (typeof callback === 'function') {
                                callback(self._properties.data);
                            }

                            // Close the modal
                            modal.hide();
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

    archive(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No task data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "archive",
                title: this._builder.Locale.get("Are you sure?"),
                body: this._builder.Locale.get("You are about to archive this task(s). Are you sure you want to continue?"),
                color: 'dark',
                callback: {
                    submit: function(element,modal){

                        // Show the modal spinner
                        modal.spinner(true);

                        // Create an array to hold promises
                        const promises = [];

                        // Create a promise for each record
                        for(const [key, record] of Object.entries(self._properties.data)){
                            promises.push(function(bar){
                                return new Promise((res, rej) => {

                                    // AJAX Request
                                    API.endpoint('/tasks/archive?id='+record.id).execute(function(response){
                                        bar.removeClass('text-bg-success text-bg-danger').addClass('text-bg-primary');
                                        res();
                                    },function(xhr, status, error){
                                        bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                        rej(error);
                                    });
                                });
                            });
                        }

                        // Execute the promises with loader
                        self._loader('dark', promises, function(){

                            // Check if a callback is provided
                            if (typeof callback === 'function') {
                                callback(self._properties.data);
                            }

                            // Close the modal
                            modal.hide();
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

    _loader(color, promises, callback = null){

        // Set Self
        const self = this;

        // Check if promises contains records
        if(!promises || (Array.isArray(promises) && promises.length === 0) || !Array.isArray(promises) ){
            console.error('No records available to process.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "code-slash",
                title: this._builder.Locale.get("Processing..."),
                color: color,
                cancel: false,
                submit: false,
                static: true,
                size: "lg",
            },
            function(modal,component){

                // Set the parent
                const parent = component;

                // Styling
                component.body.addClass('bg-gray-200 p-3 py-2 rounded-bottom');

                // Create a progress bar
                component.progress = builder.Component(
                    'progress',
                    component.body,
                    {
                        size: '32px',
                        color: 'primary',
                        striped: true,
                        animated: true,
                        scale: promises.length,
                        label: "{percent} completed {progress} of {scale} records processed",
                    },
                    async function(progress,component){

                        // Set default value
                        progress.set(0);

                        // Show the modal
                        modal.show();

                        // Loop through the records
                        for(const [key, promise] of Object.entries(promises)){

                            // Execute the promises sequentially
                            await promise(component.bar);

                            // Set the value
                            progress.set((parseInt(key) + 1));
                        }

                        // Update the color of the progress bar
                        component.bar.removeClass('text-bg-primary text-bg-danger').addClass('text-bg-success');

                        // Check if a callback is provided
                        if (typeof callback === 'function') {
                            callback();
                        }

                        // Timeout to close the modal
                        setTimeout(function(){

                            // Close the modal
                            modal.hide();
                        }, 1000);
                    },
                );
            },
        );
    }
});
builder.add('widgets','widgetTasks', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            priority: 1,
            interval: 10000,
            autoStart: true,
            callback: {},
        };
        this._priority = -1;
        this._tasks = {};
        this._interval = null;
        this._color = ['secondary','primary','warning','orange','danger'];
        this._name = ['Low','Normal','High','Urgent','Critical'];
        this._icon = ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'];
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'tasks' + this._id,
            'class': 'tasks-menu dropdown',
        });
        this._component.id = this._component.attr('id');

        // Add class to the component
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Create the button
        this._component.btn = $(document.createElement('button')).attr({
            'class': 'nav-link text-decoration-none py-2 animate-pulse-hover',
            'type': 'button',
            'data-bs-toggle': 'dropdown',
            'data-bs-auto-close': 'outside',
            'aria-expanded': 'false',
            'data-bs-placement': 'bottom',
            'data-bs-title': self._builder.Locale.get('Tasks'),
        }).appendTo(this._component);
        this._component.btn.icon = $(document.createElement('i')).attr({
            'class': 'fs-4 bi bi-list-task',
        }).appendTo(this._component.btn);
        this._component.btn.badge = $(document.createElement('span')).attr({
            'class': 'position-absolute top-25 start-75 translate-middle border border-light rounded-circle text-bg-teal',
        }).appendTo(this._component.btn);

        // Create the dropdown menu
        this._component.menu = $(document.createElement('ul')).attr({
            'class': 'dropdown-menu dropdown-menu-end shadow pb-0',
        }).appendTo(this._component);

        // Create a header
        this._component.menu.header = $(document.createElement('div')).addClass('header').appendTo(this._component.menu);
        this._component.menu.header.title = $(document.createElement('h5')).attr({
            'class': 'py-2 px-3 m-0 cursor-default d-flex justify-content-center align-items-center',
        }).appendTo(this._component.menu.header);
        this._component.menu.header.title.text(self._builder.Locale.get('Tasks'));
        this._component.menu.header.title.count = $(document.createElement('span')).attr({
            'class': 'badge rounded-pill ms-2 text-bg-primary',
        }).appendTo(this._component.menu.header.title);

        // Create the tasks list container
        this._component.menu.list = $(document.createElement('div')).attr({
            'class': 'tasks-list',
        }).appendTo(this._component.menu);

        // Create a footer
        this._component.menu.footer = $(document.createElement('div')).attr({
            'class': 'footer px-3 py-2 border-top d-flex gap-2 align-items-center',
        }).appendTo(this._component.menu);
        this._component.menu.footer.switch = $(document.createElement('div')).attr({
            'class': 'form-check form-switch mb-0',
        }).appendTo(this._component.menu.footer);
        this._component.menu.footer.switch.input = $(document.createElement('input')).attr({
            'class': 'form-check-input',
            'type': 'checkbox',
            'id': 'toggleHideLow'+this._id,
        }).appendTo(this._component.menu.footer.switch).on('change', function(){
            self._priority = this.checked ? self._properties.priority : -1;
            localStorage.setItem(
                'tasksMenuHideLowPriority',
                this.checked ? '1' : '0'
            );
            self.count();
        });
        if(localStorage.getItem('tasksMenuHideLowPriority') === '1'){
            this._component.menu.footer.switch.input.prop('checked', true);
            this._priority = this._properties.priority;
        }
        this._component.menu.footer.switch.label = $(document.createElement('label')).attr({
            'for': 'toggleHideLow'+this._id,
            'class': 'form-check-label small',
        }).appendTo(this._component.menu.footer.switch);
        this._component.menu.footer.switch.label.text(self._builder.Locale.get('Hide low priority'));
        this._component.menu.footer.link = $(document.createElement('a')).attr({
            'href': '/plugin/tasks',
            'class': 'btn btn-link btn-sm link-primary text-decoration-none ms-auto',
        }).html('<i class="bi bi-list-ul me-2"></i>'+self._builder.Locale.get('View all')).appendTo(this._component.menu.footer);

        // Check if autoStart is enabled
        if(self._properties.autoStart){

            // Start
            self.start();
        }
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

        // Retrieve Tasks
        API.endpoint('/tasks/fetchAll').data({
            conditions: [
                {key: 'assignedTo', operator: '=', value: USER_ID},
                {key: 'isActive', operator: '=', value: 1},
                {key: 'isArchived', operator: '<>', value: 1},
                {key: 'due', operator: '<', value: moment().add(1, 'days').format('YYYY-MM-DD')},
                {key: 'isCompleted', operator: '=', value: 0},
            ],
        }).execute(function(response){
            for(const [key, record] of Object.entries(response.records)){
                self.add(record);
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

        // First Load
        this.load();

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

    count(){
        this._component.menu.header.title.count.text(
            this._component.menu.list
                .find('[data-priority]')
                .filter((_, el) => +$(el).data('priority') > +this._priority)
                .length
        );
        this._component.menu.list
                .find('[data-priority]')
                .filter((_, el) => +$(el).data('priority') > +this._priority)
                .show();
        this._component.menu.list
                .find('[data-priority]')
                .filter((_, el) => +$(el).data('priority') <= +this._priority)
                .hide();
        if(this._component.menu.list.find('[data-priority]').filter((_, el) => +$(el).data('priority') > +this._priority).length > 0){
            this._component.btn.badge.show();
        } else {
            this._component.btn.badge.hide();
        }
    }

    delete(id = null){

        // Set Self
        const self = this;

        // remove the task element
        if(this._tasks[id]){
            this._tasks[id].remove();
            delete this._tasks[id];
        }

        // Update the count
        this.count();

        return this;
    }

    edit(record){

        // Set Self
        const self = this;

        // Check if the record exists
        if(typeof this._tasks[record.id] === 'undefined'){
            return this;
        }

        // Get the task
        const task = this._tasks[record.id];

        // Update the task data
        task.data = record;

        // Update the priority icon and color
        task.icon.attr('class','my-2 ms-3 align-self-center bi bi-'+this._icon[record.priority]+' text-'+this._color[record.priority]);
        task.attr('data-priority', record.priority);

        // Update the due date
        task.due.attr({
            'data-bs-title': record.due ?? new Date().toISOString(),
        });
        task.due.find('time').attr({
            'datetime': record.due ?? new Date().toISOString(),
        }).text('');
        new bootstrap.Tooltip(task.due);
        task.due.find('time').timeago();

        // Check if the due date is past
        if(record.due && new Date(record.due) < new Date()){
            task.due.addClass('overdue');
        } else {
            task.due.removeClass('overdue');
        }

        // Show or hide the due date
        if(record.due){
            task.due.show();
        } else {
            task.due.hide();
        }

        // Update the title
        task.title.text.text(self._builder.Locale.get(record.category));
        if(typeof record.target.vcard === 'object'){
            task.title.text.vcard = $(document.createElement('span')).addClass('d-none d-lg-inline-block').appendTo(task.title.text);
            if(record.target.vcard.name){
                task.title.text.vcard.append(' - ' + record.target.vcard.name);
            }
            if(record.target.vcard.title){
                task.title.text.vcard.append(' - ' + record.target.vcard.title);
            }
        }

        // Update the process
        task.process.empty();
        if(record.progress > 0){
            task.status = $(document.createElement('span')).attr({
                'class':'badge rounded-pill text-bg-'+record.process[record.progress].color,
            }).html('<i class="bi bi-'+record.process[record.progress].icon+' me-1"></i>' + self._builder.Locale.get(record.process[record.progress].name)).appendTo(task.process);
        } else {
            task.status = $(document.createElement('span')).attr({
                'class':'badge rounded-pill text-bg-success',
            }).html('<i class="bi bi-asterisk me-1"></i>' + self._builder.Locale.get('New')).appendTo(task.process);
        }
        if(typeof record.root.target.vcard !== 'undefined' && record.root.target.vcard !== null){
            task.root = $(document.createElement('span')).attr({
                'class':'badge rounded-pill text-bg-light',
            }).html('<i class="bi bi-diagram-3 me-1"></i>' + record.root.target.vcard.name).appendTo(task.process);
        }

        // Update the progress bar
        task.progress.attr({
            'aria-valuenow': record.progress,
        });
        task.progress.bar.attr({
            'style':'width:'+((record.progress / Object.entries(record.process).length) * 100)+'%',
        });
        if(record.progress > 0){
            task.progress.bar.removeClass('bg-success').addClass('bg-'+record.process[record.progress].color);
        } else {
            task.progress.bar.removeClass().addClass('progress-bar bg-success');
        }

        // Sort the tasks
        this.sort();

        // Update the count
        this.count();

        return this;
    }

    sort(){

        // Set Self
        const self = this;

        // Get all task elements and sort them by due date
        // Allways sort using the task.data.due property
        // due date = null -> end of the list
        // order from oldest to newest
        const tasks = Object.values(this._tasks).sort((a, b) => {
            const dateA = a.data.due ? new Date(a.data.due) : new Date(8640000000000000);
            const dateB = b.data.due ? new Date(b.data.due) : new Date(8640000000000000);
            return dateA - dateB;
        });

        // Clear the list
        this._component.menu.list.empty();

        // Append the sorted tasks to the list
        tasks.forEach(task => {
            task.appendTo(self._component.menu.list).off('click').click(function(){
                self._builder.Widget('task',{data: task.data.id}).view();
            });
        });

        return this;
    }

    add(record){

        // Set Self
        const self = this;

        // Check if the record already exists
        if(this._tasks[record.id]){
            this.edit(record);
            return this;
        }

        // Set ID
        const id = this._component.id + 'task' + record.id;

        // Create Task Element
        let task = $(document.createElement('div')).attr({
            'id': id,
            'class': 'list-group-item list-group-item-action task-row',
            'data-type': 'task',
            'data-priority': record.priority,
            'data-task-id': record.id,
        }).appendTo(this._component.menu.list);
        task.id = id;
        task.data = record;

        // Create the task content
        task.flex = $(document.createElement('div')).attr({
            'class':'d-flex gap-2 align-items-start',
        }).appendTo(task);
        task.icon = $(document.createElement('i')).attr({
            'class':'my-2 ms-3 align-self-center bi bi-'+this._icon[record.priority]+' text-'+this._color[record.priority],
        }).appendTo(task.flex);
        task.content = $(document.createElement('div')).attr({
            'class':'flex-grow-1 min-w-0 my-2 me-3 position-relative',
        }).appendTo(task.flex);

        // Insert the due date
        task.due = $(document.createElement('span')).attr({
            'class':'due',
            'data-bs-title': record.due ?? new Date().toISOString(),
        }).appendTo(task.content);
        task.due.append('<i class="bi bi-clock me-1"></i>');
        task.due.append($(document.createElement('time')).attr({
            'datetime': record.due ?? new Date().toISOString(),
        }).text(''));
        new bootstrap.Tooltip(task.due);
        task.due.find('time').timeago();
        if(record.due && new Date(record.due) < new Date()){
            task.due.addClass('overdue');
        }
        if(record.due){
            task.due.show();
        } else {
            task.due.hide();
        }

        // Insert the title
        task.title = $(document.createElement('div')).attr({
            'class':'d-flex justify-content-between align-items-baseline',
        }).appendTo(task.content);
        task.title.text = $(document.createElement('div')).attr({
            'class':'task-title fw-semibold truncate-1',
        }).text(self._builder.Locale.get(record.category)).appendTo(task.title);
        if(typeof record.target.vcard === 'object'){
            task.title.text.vcard = $(document.createElement('span')).addClass('d-none d-lg-inline-block').appendTo(task.title.text);
            if(record.target.vcard.name){
                task.title.text.vcard.append(' - ' + record.target.vcard.name);
            }
            if(record.target.vcard.title){
                task.title.text.vcard.append(' - ' + record.target.vcard.title);
            }
        }

        // Insert the process
        task.process = $(document.createElement('div')).attr({
            'class':'d-flex gap-2 flex-wrap mt-1',
        }).appendTo(task.content);
        if(record.progress > 0){
            task.status = $(document.createElement('span')).attr({
                'class':'badge rounded-pill text-bg-'+record.process[record.progress].color,
            }).html('<i class="bi bi-'+record.process[record.progress].icon+' me-1"></i>' + self._builder.Locale.get(record.process[record.progress].name)).appendTo(task.process);
        } else {
            task.status = $(document.createElement('span')).attr({
                'class':'badge rounded-pill text-bg-success',
            }).html('<i class="bi bi-asterisk me-1"></i>' + self._builder.Locale.get('New')).appendTo(task.process);
        }
        if(typeof record.root.target.vcard !== 'undefined' && record.root.target.vcard !== null){
            task.root = $(document.createElement('span')).attr({
                'class':'badge rounded-pill text-bg-light',
            }).html('<i class="bi bi-diagram-3 me-1"></i>' + record.root.target.vcard.name).appendTo(task.process);
        }

        // Insert the progress bar
        task.progress = $(document.createElement('div')).attr({
            'class':'progress mt-2',
            'role':'progressbar',
            'aria-valuenow': record.progress,
            'aria-valuemin': 0,
            'aria-valuemax': Object.entries(record.process).length,
        }).appendTo(task.content);
        task.progress.bar = $(document.createElement('div')).attr({
            'class':'progress-bar bg-success',
            'style':'width:'+((record.progress / Object.entries(record.process).length) * 100)+'%',
        }).appendTo(task.progress);
        if(record.progress > 0){
            task.progress.bar.removeClass('bg-success').addClass('bg-'+record.process[record.progress].color);
        }

        // Save the task
        this._tasks[record.id] = task;

        // Sort the tasks
        this.sort();

        // Update the count
        this.count();

        return this;
    }
});
