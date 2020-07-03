const backendURL = `https://watchcovout-api.herokuapp.com/api/v0`;
jQuery(document).ready(function ($) {

    jQuery(document).ready(function ($) {
        setMap();
        setNewZoneModal();
    });
    

    const setMap = ()=>{
        $.ajax({
            url: `${backendURL}/zones`,
            type: "GET"
        })
        .done((data)=>{
            for(let e of data){
                let c = L.circle([e.location.latitude, e.location.longitude], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: e.rayon*1000    
                }).addTo(map);
                c.on('click', (d)=>{
                    $('#usersModal').modal('toggle');
                    setUsersTable(e.id);
                })
            }
        });
        // Creating a Layer object
        var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        // Adding layer to the map
        map.addLayer(layer);
        map.on('dblclick', (e)=>{
            $('#newZoneModal').modal('toggle');
            $('#latitude').val(e.latlng.lat);
            $('#longitude').val(e.latlng.lng);
        });
    };

    const setUsersTable = (e)=>{

            $('#usersTable').DataTable().clear().destroy();
            $('#usersTable').DataTable({
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                'columnDefs': [
                    {
                        "targets": -1,
                        "className": "text-center"
                    }
                ],
                ajax: {
                    url: `${backendURL}/zones/${e}/visits`,
                    dataSrc: ""
                },
                columns: [
                    {"data": "nid", "width": "30%"},
                    {"data": "date", "width": "30%"},
                    {"data": (d)=>{
                        return `
                            <button id="notif_${d.nid}" type="button" class="btn btn-outline-primary notifBtn" data-toggle="modal" data-target="#sendNotifModal"><i class="fa fa-share"></i>&nbsp; Envoyer Notification</button>
                        `
                    }, "width": "40%"}
                ]
            });

            $('#usersTable tbody').on('click', '.notifBtn', setSendNotifModal);
    }

    const setSendNotifModal = ()=>{
        $('#usersModal').modal('toggle');
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

    const setNewZoneModal = ()=>{
        $('#creatZoneBtn').click(()=>{
            let data = {
                location:{
                    latitude: $('#latitude').val(),
                    longitude: $('#longitude').val()
                },
                rayon: $('#rayon').val()===''? 10 : $('#rayon').val()
            }
            $.ajax({
                url: `${backendURL}/zones`,
                type: "PUT",
                data: JSON.stringify(data),
                contentType: "application/json"
            })
            .done((data)=>{
                location.reload();
            });
        });
    }
});