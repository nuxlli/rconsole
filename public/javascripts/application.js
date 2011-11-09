;(function($) {
    var helpPage = ["oiee!!"];

    function myTermHandler() {
        console.log(this.inputChar);
        // var line = this.lineBuffer;
        // this.newLine();
        // if (line == "/help") {
        //     this.write(helpPage);
        //     this.statusLine("status: show help", 1)
        // }
        // else if (line == "exit") {
        //     this.close();
        //     return;
        // }
        // else if (line != "") {
        //     var $self = this;
        //     setTimeout(function() {
        //         $self.newLine();
        //         $self.write("You typed: %c(#f17caa)" + line + "%c0");
        //         $self.prompt();
        //     }, 2000);
        // }
        // this.prompt();
    }
    
    function myCtrlHandler() {
        console.log(this.inputChar);
    }

    var term;
    $(document).ready(function() {
        term = new Terminal({
            termDiv: "terminal",
            greeting: [
                "%c(green)*** rconsole 0.1 ***%c0",
                "type: /help to show help use"
            ],
            charMode: true,
            closeOnESC: false,
            ps: "➜",
            handler: myTermHandler,
            // ctrlHandler: myCtrlHandler
        });

        term.open();
    });
})(jQuery);

