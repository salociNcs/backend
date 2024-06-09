
watchdata add - done
user create pool - done
add watchdata to pool on watchData2Pool -done
add user to pool  -done
add votes from  watchdata2pool where pool is select  - ereldigt
load votes from votes where voted is false - ereldigt
load all watchData from votes -ereldigt
resolveVote erledigt
load votematches from votes where all user(pool2user) voted = true and watchData2Poolid all watchData2Pool where pool is selected and no user(pools2user) in votes voted watch false - erledigt

frontend voting - ereldigt
frontend show voting - erledigt

pool id und user id nicht statisch  -erleidgt
dashbnoard mit pool, voting und matches - erledigt

api calls redutirtieren indem title in db gepsichert werden nach dem ersten abruf   -ereldigt
weiter mit fetch watch data aber erst nach druck auf start matching ,damit nur bbei bedarf api calls getriggert werden - ereldigt
beim wechsel vom pool muss vote zurückgesetzt werden und der pool wird geladen und matches ist erst verfügbar wenn vote gesetzt wurden   -erldigt
pool add button wieder hinzufügen -erldigt
.
.
.

aktuell wird nur die erste siete gehollt. eigentlicvh nach dem ersten call solang bis max anzahl an pages gefunden und api call mit page angabe
beim initialen importieren der titles kommt ab 423444 nur noch uneefined - -prüfen 

pool bearbeiten, nur wenn der aktuelle user der ersteller ist - nice2have

pool delete  -> handlePoolDelete hier weiter , funktioniert alles, aber nach dem löschen wird ein andere pool ausgewähltr anstatt select a pool 
pool auswahl genre + diesnte + berücksichtiugen in api call 





source info:->>>>
netflix 203
wowtv
disney+ 372
paramount+ 444
amazon 26

203,372,444,26











tmp:
{/*<ul>
                        {pools.map(pool => (
                            <li key={pool._id} style={{ color: selectedPool === pool._id ? 'green' : 'red' }}>
                                {pool._id}
                                <button onClick={() => handlePoolSelect(pool._id)}>Auswählen</button>
                                {/* <button onClick={() => setShowModal(true)}>Benutzer einladen</button>
                                <button onClick={() => setShowPoolModal(true)}>Pool bearbeiten</button>
                                <UserModal
                                    show={showModal}
                                    onClose={() => setShowModal(false)}
                                    onSelect={handleUserSelect}
                                    pool={pool}
                                />
                                <PoolModal
                                    show={showPoolModal}
                                    onClose={() => setShowPoolModal(false)}
                                    onSelect={handlePoolEditSelect}
                                    pool={pool}
                                > */}
                            </li>
                        ))}
                        <li key="newPool">
                            <button onClick={() => handlePoolAdd()}>Neuen Pool erstellen</button>
                        </li>
                    </ul>*/}