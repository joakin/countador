
var Countador = (function(){

    var options = {
        selector: undefined, 
        digits: undefined,
        url: undefined,
        pollInterval: 30000,
        endNumber: 0,
        onEnd: function(){}
    };

    var $box = undefined;
    
    var intNumber = 0;
    var intervalAmount = 0;
    var timer = undefined;
    var minInterval = 250;
    var intervalTime = 0;
    var rateTime = 3600000; // Millis on a hour
    var numIntervals = rateTime / minInterval;

    var oldData = '';
    var data = '';
    var $numbers = [];
    var endNumber = undefined;

    var fixTimer = undefined;

    var FINISHED = false;
    var onEnd = undefined;

    function init( props ){

        $.extend( options, props );

        //Check needed values
        if( options.selector === undefined ) {
            log( 'Selector doesn\'t exist' );
            return false;
        } else {
            $box = $( options.selector );
            if( $box.length > 1 || $box.length < 1 ) {
                log( 'For Countador to work it needs 1 element, and there are ' + $box.length );
                return false;
            }
        }

        if( options.digits === undefined || isNaN( options.digits ) || options.digits <= 0 ) {
            log( 'Countador needs a number of digits to work with' );
            return false;
        }

        if( options.url === undefined || options.url === '' ) {
            log( 'Countador needs a url to poll data from' );
            return false;
        }

        if( options.endNumber === undefined || isNaN( parseInt( options.endNumber ) ) ) {
            log( 'Countador needs a limit number to stop' );
            return false;
        } else {
            endNumber = parseInt(options.endNumber);
        }

        onEnd = options.onEnd;

        //Set loading
        $box.html( 'Loading ...' );

        //Create counter
        var boxes ='';
        for( var i=0; i < options.digits; i++ ) {
            boxes += '<div id="cd'+ i +'"></div>';
        }

        //Unset loading and init counter
        $box.html( boxes );

        $numbers = Array.prototype.slice.call( $box.find( 'div' ) );
        for(var i = 0; i < options.digits; i++) {
            $numbers[i] = $( $numbers[i] );
        }

        //Do the polling
        correctData();

    };

    function pollData( callback ) {

        // Local filesystem test
        //callback( 953267, 10000 );

        //*
        $.ajax({
            url: options.url,
            dataType: 'json',
            data: {},
            success: function( data ) {
                if( data === undefined ||
                    data['number'] === undefined ||
                    isNaN( parseInt( data['number'] ) ) ||
                    data['rate'] === undefined || 
                    isNaN( parseInt( data['rate'] ) ) ) {

                    pollError( 'Problem with the data received' );
                }

                callback( parseInt( data.number ), parseInt(data.rate) );
            },
            error: function( jqXHR, textStatus, errorThrown ) {
                pollError( jqXHR, textStatus, errorThrown );
            }
        });
        // */
    };

    function pollError( message ) {

        $box.html( 'Error loading data' );
        log( 'Countador', message );

    };

    function updateCounter( number ) {

        if( FINISHED )
            return;

        intNumber = checkFinish( intervalAmount, number );
        oldData = data;
        data = Math.floor(intNumber) + '';
        
        if( data.length > options.digits ) {
            log( 'Countador: The number received is bigger than the digits specified. We will break it' );
            var start = data.length - options.digits;
            data = data.substring( start, data.length );
        } else {
            var zeros = options.digits - data.length;
            var prefix = '';
            while( zeros > 0 ) {
                prefix += '0';
                zeros--;
            }
            data = prefix + data;
        }

        renderCounter();

        if( FINISHED )
            theEnd();
    };

    function updateRate( rate ) {

        if( FINISHED )
            return;

        // Adapt the rate
        // Delete interval and create a new one
        if( timer !== undefined )
            clearTimeout( timer );

        // TODO: Right now we update when a unit has to be added. For fast
        // growing counters this is not good. A smarter implementation is
        // needed

        intervalAmount = rate / numIntervals;

        if( intervalAmount < 1 ) {
            intervalAmount = 1;
            intervalTime = rateTime / rate;
        } else {
            intervalTime = minInterval;
        }

        if( !FINISHED )
            tick();

    };

    function renderCounter() {

        for(var i = 0, l = data.length; i < l; i++ ) {
            if( data.charAt(i) != oldData.charAt(i) )
                renderNumber( i );
        }

    };

    function renderNumber( i ) {

        var $clone = $numbers[i].clone();
        $clone.addClass('dissapearingNumber');
        $numbers[i].html( data.charAt(i) );
        $numbers[i].append($clone);
        $clone.animate({
                opacity: 'toggle',
                height: 'toggle'
            }, Math.min(intervalTime / 2, 500) ,
            function(){
                $(this).remove();
            }
        );

    };

    function tick() {
        
        var newNumber = intNumber + intervalAmount;
        updateCounter( newNumber );

        if( !FINISHED )
            timer = setTimeout( tick, intervalTime );

    };

    function correctData(){

        pollData( function( number, rate ) {

            updateCounter( number );
            updateRate( rate );

            // Delete interval and create a new one
            if( fixTimer !== undefined )
                clearTimeout( fixTimer );

            if( !FINISHED )
                fixTimer = setTimeout( correctData, options.pollInterval );

        } );

    };

    function checkFinish( rate, number ) {

        if( ( rate < 0 && number <= endNumber ) || 
            ( rate > 0 && number >= endNumber ) ) {

            FINISHED = true;
            number = endNumber;
            clearTimeout( fixTimer );
            clearTimeout( timer );
            return number;
        }

        return number;

    };

    function theEnd(){
        onEnd();
    };

    return {
        init: init
    };
})();
