import { ApiHandler } from "sst/node/api";
const createObjectCsvStringifier = require('csv-writer').createObjectCsvStringifier;
import { S3 } from 'aws-sdk';

const s3 = new S3();
const bucketName = process.env.BUCKET_NAME || 'default'; // Change this bucket name to your own


export const handler = ApiHandler(async (event) => {
    let jsonBody;
    if(!event.body){
        return {
            statusCode: 500,
            body: 'Incorrect body format'
        };
    }
    else{
        jsonBody = JSON.parse(event.body);
    }


    const csvData = [
        {lastName: jsonBody.lastName, firstName: jsonBody.firstName,myNumber: jsonBody.myNumber, userId: jsonBody.userId ,reservationDate: new Date(jsonBody.date)}
    ];

    const keyName = `reservations.csv`;

  // Check if the file exists in S3
    try {
        await s3.headObject({ Bucket: bucketName, Key: keyName }).promise();
        // Return 200 if the file exists
        return {
            statusCode: 200,
            body: 'CSV file already exists in S3. No action taken.'
        };
    } catch (error) {
        // If the file does not exist, create a CSV file and upload it to S3


        const csvStringifier = createObjectCsvStringifier({
            header: [
                {id: 'lastName', title: 'Last Name'},
                {id: 'firstName', title: 'First Name'},
                {id: 'myNumber', title: 'MyNumber'},
                {id: 'userId', title: 'User ID'},
                {id: 'reservationDate', title: 'Reservation date'},
            ]
        });

        const csvContent = csvStringifier.stringifyRecords(csvData);

        const uploadParams = {
            Bucket: bucketName,
            Key: keyName,
            Body: csvContent
        };

        try {
            await s3.upload(uploadParams).promise();

            return {
                statusCode: 200,
                body: 'Reservation data validated and upload'
            };
        } catch (uploadError) {
            console.error('Error uploading to S3:', uploadError);
            return {
                statusCode: 500,
                body: 'Failed to upload reservation files'
            };
        }
    }

});
