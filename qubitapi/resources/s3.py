import boto3 # aws connection library
from botocore.exceptions import ClientError
import uuid


# Uploads a file to the qubit-projects s3 bucket
# Inputs:   f         - the file to upload as a python file object
#           extension - the file extension
# Returns:  file url on success, None on failure

def upload_file(f, extension):
    response = None
    s3 = boto3.client('s3')
    filename = str(uuid.uuid1()) + extension
    try:
        s3.upload_fileobj(
            f, 'qubit-projects', filename,
            ExtraArgs={'ACL': 'public-read'}
        )
        response = 'https://qubit-projects.s3.amazonaws.com/%s' % (filename)
    except ClientError as error:
        print("Upload went wrong {}".format(error))
    return response