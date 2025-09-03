import React, {useCallback, useMemo, useState} from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

// Import date-fns functions for date localization
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import enGB from 'date-fns/locale/en-GB';
import es from 'date-fns/locale/es';
import fr from 'date-fns/locale/fr';
import arEG from 'date-fns/locale/ar-EG';

// Define the locales for date-fns, Maybe we can look at tacking this from the Moodle locale?
const locales = {
    'en-US': enUS,
    'en-GB': enGB,
    'es': es,
    'fr': fr,
    'ar-EG': arEG
};

const cultures = ['en-US', 'en-GB', 'es', 'fr', 'ar-EG'];
const lang = {
    'en-US': null,
    'en-GB': null,
    es: {
        week: 'Semana',
        work_week: 'Semana de trabajo',
        day: 'Día',
        month: 'Mes',
        previous: 'Atrás',
        next: 'Después',
        today: 'Hoy',
        agenda: 'El Diario',
    },
    fr: {
        week: 'La semaine',
        work_week: 'Semaine de travail',
        day: 'Jour',
        month: 'Mois',
        previous: 'Antérieur',
        next: 'Prochain',
        today: `Aujourd'hui`,
        agenda: 'Ordre du jour',
    },
    'ar-EG': {
        week: 'أسبوع',
        work_week: 'أسبوع العمل',
        day: 'يوم',
        month: 'شهر',
        previous: 'سابق',
        next: 'التالي',
        today: 'اليوم',
        agenda: 'جدول أعمال',
    },
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Import the CSS for react-big-calendar
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {InputGroup} from "react-bootstrap";
import Form from "react-bootstrap/Form";

export default function CalendarShim(props) {
    const [culture, setCulture] = useState('en-US');
    const [rightToLeft, setRightToLeft] = useState(false);

    const cultureOnClick = useCallback(
        ({ target: { value } }) => {
            // really better to useReducer for simultaneously setting multiple state values
            setCulture(value);
            setRightToLeft(value === 'ar-EG');
        },
        [setCulture]
    );

    const { defaultDate, messages } = useMemo(
        () => ({
            defaultDate: new Date(2015, 3, 1),
            messages: lang[culture],
        }),
        [culture]
    );

    const { scrollToTime } = useMemo(
        () => ({
            scrollToTime: new Date(1970, 1, 1, 6),
        }),
        []
    );

    return (
        <>
            <InputGroup className="mb-3">
                <InputGroup.Text id="formStart">Language select</InputGroup.Text>
                <Form.Select aria-label="Language select" value={culture} onChange={cultureOnClick}>
                    {cultures.map((c, idx) => (
                        <option key={idx} value={c}>
                            {c}
                        </option>
                    ))}
                </Form.Select>
            </InputGroup>
            <Calendar
                {...props}
                localizer={localizer}
                culture={culture}
                defaultDate={defaultDate}
                messages={messages}
                events={props.events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable
                scrollToTime={scrollToTime}
                rtl={rightToLeft}
            />
        </>
    );
}
