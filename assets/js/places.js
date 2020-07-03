const backendURL = `https://watchcovout-api.herokuapp.com/api/v0`;
jQuery(document).ready(function ($) {

    jQuery(document).ready(function ($) {
        setUsersTable();
    });
    

    const setUsersTable = ()=>{
            $('#placesTable').DataTable().clear().destroy();
            $('#placesTable').DataTable({
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                'columnDefs': [
                    {
                        "targets": -1,
                        "className": "text-center"
                    }
                ],
                ajax: {
                    url: `${backendURL}/places`,
                    dataSrc: ""
                },
                columns: [
                    {"data": "id", "width": "10%"},
                    {"data": (e)=>{
                        return `
                            <div id = "map_${e.id}" style = "width: 200px; height: 200px"></div>
                            <script>
                                // Creating map options
                                var mapOptions_${e.id} = {
                                    center: [${e.location.latitude}, ${e.location.longitude}],
                                    zoom: 17
                                }
                                
                                if (map_${e.id} != undefined) { map_${e.id}.remove(); }
                                // Creating a map object
                                var map_${e.id} = new L.map('map_${e.id}', mapOptions_${e.id});
                                var marker_${e.id} = L.marker([${e.location.latitude}, ${e.location.longitude}]).addTo(map_${e.id});
            
                                // Creating a Layer object
                                var layer_${e.id} = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                                // Adding layer to the map
                                map_${e.id}.addLayer(layer_${e.id});
                            </script>
                        `
                    }, "width": "30%"},
                    {"data": "title", "width": "30%"},
                    {"data": "type", "width": "5%"},
                    {"data": "numberOfPlaces", "width": "5%"},
                    {"data": (e)=>{
                        return `
                            <button id="notif_${e.nid}" type="button" class="btn btn-outline-primary notifBtn" data-toggle="modal" data-target="#sendNotifModal"><i class="fa fa-share"></i>&nbsp; Envoyer Notification</button>
                        `
                    }, "width": "20%"}
                ]
            });

            $('#placesTable tbody').on('click', '.notifBtn', setSendNotifModal);
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
                }},
                {"data": (e)=>{
                    return `<button id="visits_${e.placeID}_${e.date}_${e.time}" type="button" class="btn btn-outline-success otherVisitsBtn" data-toggle="modal" data-target="#otherVisitsModal"><i class="fa fa-archive"></i>&nbsp; Autres Visiteurs</button>`
                }}
            ]
        });

        $('#visitsTable tbody').on('click', '.placeInofdBtn', setPlaceModal);
        $('#visitsTable tbody').on('click', '.otherVisitsBtn', setOtherVisitsModal);
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

    const setOtherVisitsModal = ()=>{
        let data = {
            place_id: event.target.id.split('_')[1],
            date: event.target.id.split('_')[2],
            time: event.target.id.split('_')[3]
        };

        $('#userVisitsModal').modal('toggle');
        $('#otherVisitsModalTitle').html(`Les visiteures de <b>${data.place_id}</b> a <b>${data.date} ${data.time}</b>`);

        $('#otherVisitsTable').DataTable().clear().destroy();
        $('#otherVisitsTable').DataTable({
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
            ajax: {
                url: `${backendURL}/places/${data.place_id}/users?date=${data.date}&time=${data.time}`,
                dataSrc: ""
            },
            columns: [
                {data: "nid"}
            ]
        });
    }

    const setMeetsModal = ()=>{
        $('#userVisitsModalTitle').html(`Les rencontres de <b>${event.target.id.split('_')[1]}</b> dans les 15 deniers jours`);
        let days = [];
        let now = new Date();

        for(i = 0 ; i<=15 ; i++){
            now.setDate((now.getDate()-i));
            days.push(now.toISOString().substring(0,10));
        }

        $('#meetsTable').DataTable().clear().destroy();
        $('#meetsTable').DataTable({
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
            ajax: {
                url: `${backendURL}/users/${event.target.id.split('_')[1]}/meets?dates=${days.join()}`,
                dataSrc: ""
            },
            columns: [
                {"data": "nid"},
                {"data": "count"}
            ]
        });
    }
});