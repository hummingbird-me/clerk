# Clerk

Clerk is the Kitsu service for managing uploaded files.  It provides out-of-band uploading for other
Kitsu services to depend on, tracks places which refer to a given file, deletes files which are no
longer referenced, generates alternative versions of uploaded files, and tracks metadata of those
files.

## Uploading

Uploading is a pretty standard direct-to-S3 uploader system.

First, you request a ticket from the Clerk API:

```gql
mutation {
  getTicket(mimeType: "image/jpeg", size: 4123501) {
    url
    fields {
      name
      value
    }
  }
}
```

If the upload is approved, you will receive a response with the data you'll use to upload:

```json
{
  "url": "https://s3.amazonaws.com/kitsu-media",
  "fields": [
    {
      "name": "key",
      "value": "ed37ef68-9fbd-4d20-8bb1-a77aed56de2d"
    },
    {
      "name": "bucket",
      "value": "kitsu-media"
    },
    {
      "name": "X-Amz-Algorithm",
      "value": "AWS4-HMAC-SHA256"
    }
  ]
}
```

No, wait, don't leave, it's not as complex as it looks!  It's basically done everything for you!

There's a URL and a list of form fields in the response.  Take the form fields, add your file with
the name `file`, and upload it as a `POST` request to the URL in the `url` field.

## References

References are how Clerk tracks which files are still in use and deletes them when they're no longer
necessary, as well as how it prevents abuse.

### Temporary References

A Temporary Reference keeps a file from being deleted for a specific time period.  One is
automatically created when you call `getTicket` to keep the file from being deleted before it can be
inserted into another service.

Clients can revoke their own temporary references before the window ends.  For example, if a user
uploads an image but doesn't use it, you could free it when the user navigates away.

### Permanent References

A Permanent Reference keeps a file from being deleted as long as it's used by another service.

## Processing Pipeline

Each file, after uploading is complete, will be processed to produce views and extract metadata.
The views are stored parallel to the original, and the metadata is stored in the database.
