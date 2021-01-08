const getSmartClient = () =>
  new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      /* eslint-disable-next-line */
    const smart = FHIR.client({

        // === Cerner sandbox ===
        serviceUrl:
          'https://fhir-ehr-code.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d',
        patientId: '1316024'

        // === SMART on FHIR sandbox ===
        //serviceUrl: 'https://r2.smarthealthit.org',
        //patientId: 'smart-1137192'
      });

      resolve(smart);
    } else {
      /* eslint-disable-next-line */
    FHIR.oauth2.ready(function(smart, err) {
        if (err) {
          reject(err);
        }
        resolve(smart);
      });
    }
  });

export default getSmartClient;
