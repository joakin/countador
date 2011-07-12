
var Countador = (function(){

    var options = {
        selector: undefined, 
        digits: undefined,
        url: undefined,
        pollInterval: 5000
    };

    var $box = undefined;
    
    var intNumber = 0;
    var intervalAmount = 0;
    var intervalTime = undefined;
    var timer = undefined;
    var minInterval = 250;
    var rateTime = 3600000; // Millis on a hour
    var numIntervals = rateTime / minInterval;

    var oldData = '';
    var data = '';
    var $numbers = [];

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

        //Set loading
        $box.html( 'Loading ...' );

        //Do the polling
        pollData( function( number, rate ) {

            //Create counter
            var boxes ='';
            for(var i=0; i < options.digits; i++ ) {
                boxes += '<div id="cd'+ i +'"></div>';
            }

            //Unset loading and init counter
            $box.html(boxes);

            $numbers = Array.prototype.slice.call( $box.find('div') );
            for(var i = 0; i < options.digits; i++) {
                $numbers[i] = $( $numbers[i] );
            }

            updateCounter( number );
            updateRate( rate );
        });
    };

    function pollData( callback ) {

        // Local filesystem test
        callback( 953267, 34000 );

        /*
        $.ajax({
            url: options.url,
            dataType: 'json',
            data: {},
            success: function( data ) {
                if( data === undefined ||
                    data['number'] !== undefined ||
                    isNaN( parseInt( data['number'] ) ) ||
                    data['rate'] !== undefined || 
                    isNaN( parseInt( data['rate'] ) ) ) {

                    pollError( 'Problem with the data received' );
                }

                callback( parseInt( data.number ), data.rate );
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

        intNumber = number;
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

    };

    function updateRate( rate ) {

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

        timer = setTimeout( tick, intervalTime );

    };

    function renderCounter() {

        for(var i = 0, l = data.length; i < l; i++ ) {
            if( data[i] != oldData[i] )
                renderNumber( i );
        }

    };

    function renderNumber( i ) {

                $numbers[i].html( data[i] );

    };

    function tick() {
        
        var newNumber = intNumber + intervalAmount;
        updateCounter( newNumber );
        timer = setTimeout( tick, intervalTime );

    };

    return {
        init: init
    };
})();
