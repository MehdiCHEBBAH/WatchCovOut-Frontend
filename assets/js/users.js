const backendURL = `http://localhost:3000/api/v0`;
jQuery(document).ready(function ($) {

    jQuery(document).ready(function ($) {
        setUsersTable();
    });
    

    const setUsersTable = ()=>{
            $('#usersTable').DataTable().clear().destroy();
            $('#usersTable').DataTable({
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                ajax: {
                    url: `${backendURL}/users`,
                    dataSrc: ""
                },
                columns: [
                    {"data": (e)=>{
                        return `<a type="button" target="_blank" href="${e.nationalCardPicURL}" class="btn btn-link btn-lg btn-block">${e.nid}</a>`
                    }},
                    {"data": (e)=>{
                        return e.isConfirmedCase? `<span class="badge badge-danger">Oui</span>` : `<span class="badge badge-success">Non</span>`
                    }},
                    {"data": (e)=>{
                        return `
                            <button id="visits_${e.nid}" type="button" class="btn btn-outline-success visitsBtn" data-toggle="modal" data-target="#userVisitsModal"><i class="fa fa-archive"></i>&nbsp; Visites</button>
                            <button id="notif_${e.nid}" type="button" class="btn btn-outline-primary notifBtn" data-toggle="modal" data-target="#sendNotifModal"><i class="fa fa-share"></i>&nbsp; Send Notification</button>
                            `
                    }}
                ]
            });

            $('#usersTable tbody').on('click', '.visitsBtn', setUserVisitsModal);
            $('#usersTable tbody').on('click', '.notifBtn', setSendNotifModal);
    }

    const setUserVisitsModal = ()=>{
        $('#userVisitsModalTitle').html(`Les visites de <b>${event.target.id.split('_')[1]}</b>`);

        $('#visitsTable').DataTable().clear().destroy();
        $('#visitsTable').DataTable({
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
            ajax: {
                url: `${backendURL}/users/${event.target.id.split('_')[1]}/visits`,
                dataSrc: ""
            },
            columns: [
                {"data": "date"},
                {"data": "time"},
                {"data": (e)=>{
                    return `<button id="places_${e.placeID}" type="button" class="btn btn-link btn-lg btn-block placeInofdBtn" data-toggle="modal" data-target="#placeInfosModal">${e.placeID}</button>`
                }}
            ]
        });

        $('#visitsTable tbody').on('click', '.placeInofdBtn', setPlaceModal);
    }

    const setPlaceModal = ()=>{
        $('#userVisitsModal').modal('toggle');

        $.ajax({
            url: `${backendURL}/places/${event.target.id.split('_')[1]}`,
            type: "GET"
        })
        .done((data)=>{
            $('#placeInfosModalTitel').html(`${data.title} <span class="badge badge-secondary">${data.type}</span>`);
            $('#placeInfosModalBody').html(`
                
                <p style="font-size: 20px"><b>Createur: </b>${data.nid}</p>
                <p style="font-size: 20px"><b>Nembre de places: </b>${data.numberOfPlaces}</p>

                <br>
                <div id = "map" style = "width: 650px; height: 350px"></div>
                <script>
                    // Creating map options
                    var mapOptions = {
                        center: [${data.location.latitude}, ${data.location.longitude}],
                        zoom: 17
                    }
                    
                    // Creating a map object
                    var map = new L.map('map', mapOptions);
                    var marker = L.marker([${data.location.latitude}, ${data.location.longitude}]).addTo(map);

                    // Creating a Layer object
                    var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                    
                    // Adding layer to the map
                    map.addLayer(layer);
                </script>
                  
            `)
        });
    }

    const setSendNotifModal = ()=>{
        $('#sendNotifModalBody').html(`
            <div class="card">
                <div class="card-header">
                    Envoyer notification a <strong>${event.target.id.split('_')[1]}</strong>
                </div>
                <div class="card-body card-block">
                    <form action="" method="post" class="form-horizontal">
                        <div class="row form-group">
                            <div class="col col-md-3"><label for="titre" class=" form-control-label">Titre</label></div>
                            <div class="col-12 col-md-9"><input type="text" id="titre" name="titre" placeholder="Titre de notification..." class="form-control"></div>
                        </div>
                        <div class="row form-group">
                            <div class="col col-md-3"><label for="contenu" class=" form-control-label">Contenu</label></div>
                            <div class="col-12 col-md-9"><textarea name="contenu" id="contenu" rows="9" placeholder="Contenu..." class="form-control"></textarea></div>
                        </div>
                    </form>
                </div>
            </div>     
        `);

        $('#sendNotifmodalFooter').html(`
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button id="sendNotifBtn_${event.target.id.split('_')[1]}" type="button" class="btn btn-primary">Send</button>
        `);

        $(`#sendNotifBtn_${event.target.id.split('_')[1]}`).click(()=>{
            let data = {
                title: $("#titre").val(),
                content: $("#contenu").val(),
                type: 'CENTER_DE_SUIVI',
                dateTime: new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().substring(0, 16)
            };
            let nid = event.target.id.split('_')[1];
            $.ajax({
                url: `${backendURL}/users/${nid}/notifications`,
                type: "PUT",
                data: JSON.stringify(data),
                contentType: "application/json"
            })
            .done((data)=>{
                $('#sendNotifModal').modal('toggle');
                $('#notifications').html(`
                    <div class="alert  alert-success alert-dismissible fade show" role="alert">
                        <span class="badge badge-pill badge-success">Success</span> Vous avez envoye une notification a ${nid}.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                `);
            });
        });
    }
});