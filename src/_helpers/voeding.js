import { DateTime } from "luxon";

export const needsMelkpoeder = (result) => {
  if (!result.gekregen) {
    return false;
  }

  // should be made more complex but for now the API sending only 10 entries will make this semi-decent
  for (let entry of result.gekregen) {
    if (
      entry.object &&
      entry.object.naam &&
      entry.object.naam.indexOf("Melkpoeder") > -1
    ) {
      return true;
    }
  }

  return false;
};

export const needsVerjaardag = (contacten) => {
  for (let contact of contacten) {
    if (isJarig(contact.geboorteDatum)) {
      return true;
    }
  }

  return false;
};

// JS version of ZOHO button
export const voedingVandaag = async (data) => {
  const today = new Date();
  for (let pakket of data.Geschiedenis) {
    if (pakket.Datum == formatDate(today)) {
      throw new Error("Al pakket gekregen vandaag");
    }
  }

  console.log(data.Geschiedenis);
  const newGeschiedenis = [
    {
      Datum: formatDate(today),
      Gekregen: ["Voeding"],
    },
  ].concat(data.Geschiedenis);

  data.Geschiedenis = newGeschiedenis;

  await window.ZOHO.CRM.API.updateRecord({
    Entity: "Voeding",
    Trigger: ["workflow"],
    APIData: data,
  });
};

function formatDate(d) {
  var month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
}

export const isJarig = (geboorteDatum) => {
  console.log(new Date(geboorteDatum));
  const gebDatum = DateTime.fromObject({
    year: DateTime.now().year,
    month: new Date(geboorteDatum).getMonth() + 1,
    day: new Date(geboorteDatum).getDate(),
  }).startOf("day");

  const nextWeek = DateTime.now().startOf("day").plus({ days: 7 });
  const today = DateTime.now().startOf("day");

  return (
    today.valueOf() <= gebDatum.valueOf() &&
    nextWeek.valueOf() > gebDatum.valueOf()
  );
};
