(function(window){
  window.extractData = function() {
    var ret = $.Deferred();
    var smart;
    var patient;
    var obv;
    var appointments;


    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onSuccess() {
      var byCodes = smart.byCodes(obv, 'code');
      var gender = patient.gender;

      var fname = '';
      var lname = '';

      if (typeof patient.name[0] !== 'undefined') {
        fname = patient.name[0].given.join(' ');
        lname = patient.name[0].family.join(' ');
      }

      var height = byCodes('8302-2');
      var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
      var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
      var hdl = byCodes('2085-9');
      var ldl = byCodes('2089-1');

      var p = defaultPatient();
      p.birthdate = patient.birthDate;
      p.gender = gender;
      p.fname = fname;
      p.lname = lname;
      p.height = getQuantityValueAndUnit(height[0]);

      if (typeof systolicbp != 'undefined')  {
        p.systolicbp = systolicbp;
      }

      if (typeof diastolicbp != 'undefined') {
        p.diastolicbp = diastolicbp;
      }

      p.hdl = getQuantityValueAndUnit(hdl[0]);
      p.ldl = getQuantityValueAndUnit(ldl[0]);

      console.log('Appointments Data =',appointments);

      ret.resolve(p);
    }

    function onReady(client)  {
      smart = client;
      if (smart.hasOwnProperty('patient')) {
        patient = smart.patient.read();
        obv = smart.patient.request(`Observation`);
        var date = new Date();
        appointments = smart.patient.request("Appointment?date=ge" + date.toISOString());

        Promise.all([pt, obv, appointments]).then(onSuccess);
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  window.createAppointment = function () {
    var dateSelected = $("#datepicker").val();
                 console.log("\nCreate Appointment Function, date=",dateSelected);
    window.smartAPI.create({resourceType: Appointment, status: 'proposed', start: dateSelected})

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
