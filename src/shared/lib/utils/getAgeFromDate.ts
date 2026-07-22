export default function getAgeFromDate(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() &&
      today.getDate() >= birthday.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}