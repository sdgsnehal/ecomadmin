import multiparty from "multiparty";
import s3 from "aws-sdk/clients/s3";
export default async function handler(req, res) {
  const form = new multiparty.Form();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
      res.json("ok");
    });
  });
}
export const config = {
  api: {
    bodyParser: false,
  },
};
