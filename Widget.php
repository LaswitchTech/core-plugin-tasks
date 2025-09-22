<!-- ======= Task ======= -->
<?php if($this->Auth->isAuthenticated()): ?>
    <div class="nav-item" id="tasksMenu"></div>
    <script>
        (function () {
            $(document).ready(function(){
                builder.Widget('tasksMenu', '#tasksMenu');
            });
        })();
    </script>
<?php endif; ?>
<!-- ======= End Task ======= -->
