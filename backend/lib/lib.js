
//revisar si ya hizo checkIn hoy
 function hasCheckedInToday(attendances) {
  // Obtenemos la fecha actual, pero la normalizamos a medianoche (00:00:00)
  // para que la comparación sea solo por día, mes y año, ignorando la hora.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Iteramos sobre cada asistencia en el array 'attendances'.
  for (const attendance of attendances) {
    // Convertimos el timestamp de 'checkIn' (que viene en milisegundos) a un objeto Date.
    const checkInDate = new Date(Number(attendance.checkIn));

    // Normalizamos también la fecha del checkIn a medianoche.
    checkInDate.setHours(0, 0, 0, 0);

    // Comparamos las dos fechas. Si coinciden, significa que el checkIn
    // se hizo hoy.
    if (checkInDate.getTime() === today.getTime()) {
      // Si encontramos un checkIn de hoy, retornamos true inmediatamente.
      return true;
    }
  }

  // Si el bucle termina y no se encontró ningún checkIn de hoy,
  // retornamos false.
  return false;
}

module.exports = hasCheckedInToday;