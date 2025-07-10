<div class="col-12" id="layout"></div>
<script>
    $(document).ready(function(){
        $.ajax({
            url: '/api/tasks/fetchAll',
            headers: {'X-CSRF-Authorization': CSRF_KEY},
            type: 'POST',dataType: 'json',
            data: {
                conditions: [
                    {key: 'assignedTo', operator: '=', value: USER_ID},
                    {key: 'isActive', operator: '=', value: 1},
                    {key: 'isArchived', operator: '<>', value: 1},
                    {key: 'isCompleted', operator: '=', value: 0},
                ]
            },
            error: function(xhr, status, error) {
                let color = 'info', icon = 'question-circle', title = builder.Locale.get(xhr.statusText), content = builder.Locale.get(xhr.responseText);
                switch(xhr.status){
                    case 403: color = 'danger'; icon = 'shield-lock'; break;
                    case 404: color = 'warning'; icon = 'question-diamond'; break;
                    case 500: color = 'danger'; icon = 'bug'; break;
                }
                builder.Component("alert","#layout",{icon:icon,color:color,title:title},function(alert,component){component.content.html('<pre class="m-0 p-2">'+content+'</pre>');});
            },
            success: function(response) {
                console.log(response);

                // Create a layout for the task list
                var layout = $(document.createElement('div')).addClass('row').appendTo('#layout');
                layout.list = $(document.createElement('div')).addClass('col-12').attr('style','transition: all 300ms ease 0s;').appendTo(layout);
                layout.details = $(document.createElement('div')).addClass('col-8').attr('style','transition: all 300ms ease 0s; opacity: 0; display: none;').appendTo(layout);

                // Create a Card for the task list
                builder.Component(
                    "card",
                    layout.list,
                    {
                        class: {
                            body: "p-0",
                        },
                        icon: "card-text",
                        title: builder.Locale.get("List"),
                    },
                    function(card,component){
                        builder.Component(
                            "accordion",
                            component.body,
                            {
                                class: {
                                    component: "w-100",
                                },
                                flush: true,
                                properties: {
                                    class: {
                                        collapse: "bg-transparent",
                                    },
                                }
                            },
                            function(accordion,component){
                                for(const [row, category] of Object.entries(response.dependencies.categories)){
                                    accordion.add(
                                        {
                                            icon: category.icon,
                                            title: builder.Locale.get(category.name.charAt(0).toUpperCase() + category.name.slice(1)),
                                        },
                                        function(item,accordion){
                                            item.header.button.attr({
                                                'data-category': category,
                                            });
                                            item.content.addClass('p-0');
                                            builder.Component(
                                                "list",
                                                item.content,
                                                {
                                                    class: {
                                                        component: "bg-transparent",
                                                    },
                                                    icon: "empty",
                                                },
                                                function(list,component){
                                                    for(const [id, task] of Object.entries(response.records)){
                                                        if(task.category == category.name){
                                                            list.add(
                                                                {
                                                                    field: builder.Parser.parse(task.label),
                                                                },
                                                                function(item,list){

                                                                    // Add attributes to the item
                                                                    item.attr({
                                                                        'data-task': task.id,
                                                                        'data-category': task.category,
                                                                    });

                                                                    // on hover Add bg-secondary to the item
                                                                    item.hover(
                                                                        function(){
                                                                            item.addClass('text-bg-secondary cursor-pointer');
                                                                        },
                                                                        function(){
                                                                            item.removeClass('text-bg-secondary cursor-pointer');
                                                                        },
                                                                    );

                                                                    // Set position to relative
                                                                    item.field.addClass('position-relative');

                                                                    // Add an absolute position container for the due date and priority
                                                                    item.field.container = $(document.createElement('div')).addClass('position-absolute top-0 end-0 me-2 mt-2').appendTo(item.field);

                                                                    // Add the priority to the item
                                                                    let color = ['secondary','primary','warning','orange','danger'];
                                                                    let name = ['Low','Normal','High','Urgent','Critical'];
                                                                    item.priority = $(document.createElement('span')).attr({
                                                                        "class": "badge rounded-end-0 text-bg-"+color[task.priority],
                                                                        "data-type": "priority",
                                                                        "data-task": task.id,
                                                                    }).text(name[task.priority]).appendTo(item.field.container);

                                                                    // Set default background to null
                                                                    var bg = 'text-bg-secondary';

                                                                    // If task.due date is today, set bg to warning
                                                                    if(moment(task.due).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')){
                                                                        bg = 'text-bg-warning';
                                                                    }

                                                                    // If task.due date is past (including time), set bg to danger
                                                                    if(moment(task.due).isBefore(moment())){
                                                                        bg = 'text-bg-danger';
                                                                    }

                                                                    // Add the due date to the item
                                                                    item.due = $(document.createElement('span')).addClass(bg).addClass('badge rounded-start-0 text-bg-secondary').text(moment(task.due).format('YYYY-MM-DD HH:mm')).appendTo(item.field.container);

                                                                    // Remove the icon and actions divs
                                                                    setTimeout(() => {
                                                                        item.icon.remove();
                                                                        item.container.icon.remove();
                                                                        item.actions.remove();
                                                                        item.field.removeClass('px-1 py-2 ps-2 pe-0').addClass('p-2')
                                                                    }, 300);

                                                                    // Progress
                                                                    builder.Component(
                                                                        "progress",
                                                                        item,
                                                                        {
                                                                            class: {
                                                                                component: "m-2 mt-0",
                                                                            },
                                                                            callback: {
                                                                                change: function(progress){},
                                                                            },
                                                                            scale: task.scale,
                                                                            label: "{percent}",
                                                                            color: task.assignedTo.id == USER_ID ? "success" : "info",
                                                                        },
                                                                        function(progress,component){
                                                                            progress.set(task.progress);
                                                                        },
                                                                    );

                                                                    // on click
                                                                    item.click(function(){

                                                                        // add URL parameter
                                                                        let params = new URLSearchParams(window.location.search);
                                                                        params.set('id', task.id);
                                                                        let newUrl = window.location.pathname + '?' + params.toString();
                                                                        window.history.pushState({ path: newUrl }, '', newUrl);

                                                                        // Rearrange the layout
                                                                        if(layout.list.hasClass('col-12')){
                                                                            layout.list.addClass('col-4').removeClass('col-12');
                                                                            setTimeout(() => {
                                                                                layout.details.css({"opacity": 1, "display": "block"});
                                                                            }, 300);
                                                                        }

                                                                        // Update the active item
                                                                        $('li.list-group-item').removeClass('text-bg-primary');
                                                                        item.addClass('text-bg-primary');

                                                                        // Setup the details
                                                                        TaskDetails(task.id, layout.details, function(){});
                                                                    });
                                                                },
                                                            );
                                                        }
                                                    }
                                                    component.find('[data-vcard]').off().click(function(){
                                                        vCardModal($(this).attr('data-vcard'),$(this).attr('data-vcard-name'));
                                                    });
                                                },
                                            );
                                            setTimeout(function(){
                                                if(category.isShown){ $('#' + item.id + 'collapse').collapse('show'); }
                                                item.removeAttr('data-search')
                                            }, 0);
                                        },
                                    );
                                }

                                // Retrieve the ID from the URL
                                var url = new URL(window.location.href);
                                var id = url.searchParams.get("id");

                                // Trigger the click event of the item
                                setTimeout(() => {
                                    if(id){
                                        $('[data-task="'+id+'"]').last().trigger('click');
                                    }
                                }, 300);
                            }
                        );
                    },
                );
            }
        });
    });
</script>
