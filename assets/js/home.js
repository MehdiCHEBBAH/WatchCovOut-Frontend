(function ($) {
    let host = "https://watchcovout-api.herokuapp.com";
    $(document).ready(function () {

        // get users stats
        $.get(host + "/api/v0/users/", function (data, status) {
            function checkSick(element) {
                return element.isConfirmedCase 
            }
            $("#cov-members").text(data.length.toString());
            $("#cov-confirmed-members").text(data.filter(checkSick).length.toString());
            
        });

        // get places stats
        $.get(host + "/api/v0/places/", function (data, status) {
            $("#cov-places-number").text(data.length.toString());
        });

        let now = new Date();
        $.get( host + `/api/v0/users/?suspect&dates=${now.toISOString().substring(0,10)}`, (data, status)=>{
            console.log(data);
            $("#cov-suspect-members").text(data.length.toString());
        });
        
    });

    $(document).ready(function () {
        mapboxgl.accessToken =
            "pk.eyJ1IjoieWFhY2luZTEyIiwiYSI6ImNrYzNrd2gydjEyemEydGxrbzhleWkwaHIifQ.TnOnKQn9B_CR5RpwZnyE0A";
        var map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v11",
            center: [12.550343, 55.665957],
            zoom: 8,
        });

        var marker = new mapboxgl.Marker()
            .setLngLat([12.550343, 55.665957])
            .addTo(map);
    });
})(jQuery);
