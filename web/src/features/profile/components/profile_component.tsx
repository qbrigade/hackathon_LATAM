import { MapPin, Mail, Calendar, Users, Star, Eye, Pencil, User } from 'lucide-react';
import { Button } from '@common/components/button';
import { useAuthStore } from '@auth/store/auth_store';
import { PE_DEPARTMENTS, PE_DISTRICTS, DEPARTMENT_OPTIONS, PROVINCES_BY_DEPARTMENT, DISTRICTS_BY_PROVINCE } from '@common/data/geo';
import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@db/client';
import { useLocation } from 'wouter';
import { Card } from '@profile/components/ui/card';
import { Badge } from '@profile/components/ui/badge';
import { Avatar } from '@profile/components/ui/avatar';
import {
  pushBlobToStorage,
  canUpdateGeoLocation,
  getDaysUntilNextGeoUpdate,
  getNextGeoUpdateDate
} from '@common/utils';
import type { Tables } from '@db/schema';
import VotesCountdownCard from './VotesCountdownCard';
import type { PublicationPreview } from '@home/types';

// Hook to update URL with query parameters
const useUpdateUrl = () => {
  const [, navigate] = useLocation();

  return (tab: string) => {
    const currentPath = window.location.pathname;
    const newUrl = `${currentPath}?tab=${tab}`;
    navigate(newUrl);
  };
};

type Project = Tables<'projects'>
type Publication = Omit<PublicationPreview, 'source_id'>
type Event = Tables<'events'>
type Profile = Tables<'profiles'>
type Votes = Tables<'project_votes'>

interface ProfileComponentProps {
  userId?: string
  isOwnProfile?: boolean
  initialTab?: string | null
  onTabChange?: (tab: string) => void
}

export default function ProfileComponent({ userId, isOwnProfile, initialTab, onTabChange }: ProfileComponentProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [, navigate] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [votes, setVotes] = useState<Votes[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [externalProfile, setExternalProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isOwnProfile || false);
  const [tempBio, setTempBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingGeo, setIsEditingGeo] = useState(false);
  const [tempDepartment, setTempDepartment] = useState('');
  const [tempProvince, setTempProvince] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');
  const [geoUpdateError, setGeoUpdateError] = useState<string | null>(null);
  const [isUpdatingGeo, setIsUpdatingGeo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateUrl = useUpdateUrl();

  // Mapping from URL tabs to internal tabs
  const urlToInternalTab = {
    proyectos: 'projects',
    eventos: 'events',
    publicaciones: 'publications',
    votos: 'votes'
  } as const;

  const internalToUrlTab = {
    projects: 'proyectos',
    events: 'eventos',
    publications: 'publicaciones',
    votes: 'votos',
  } as const;

  const [activeTab, setActiveTab] = useState<'projects' | 'events' | 'publications' | 'votes'>(() => {
    if (!initialTab) return 'projects';
    return urlToInternalTab[initialTab as keyof typeof urlToInternalTab] || 'projects';
  });

  const isOwn = isOwnProfile ?? (!userId || userId === currentUser?.id);
  const targetUserId = userId || currentUser?.id;
  const displayProfile = isOwn ? currentUser?.profile : externalProfile;

  const fetchExternalProfile = useCallback(async () => {
    if (!userId) return;

    setProfileLoading(true);
    try {
      const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setExternalProfile(data);
    } catch (error) {
      console.error('Error fetching external profile:', error);
      navigate('/404');
    } finally {
      setProfileLoading(false);
    }
  }, [navigate, userId]);

  useEffect(() => {
    if (!isOwn && userId) {
      fetchExternalProfile();
    }
  }, [userId, isOwn, fetchExternalProfile]);

  const handleEditClick = () => {
    setTempBio(displayProfile?.bio || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.id || !isOwn) return;

    setIsUpdating(true);
    try {
      let avatarUrl = currentUser.profile?.avatar_url || null;

      if (fileInputRef.current?.files?.[0]) {
        const bucketPath = await pushBlobToStorage(db, 'multimedia', fileInputRef.current.files[0]);
        avatarUrl = bucketPath;
      }

      const { error } = await db
        .from('profiles')
        .update({
          bio: tempBio,
          ...(avatarUrl && { avatar_url: avatarUrl }),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      if (currentUser) {
        useAuthStore.getState().setUser({
          ...currentUser,
          profile: {
            ...currentUser.profile,
            bio: tempBio,
            avatar_url: avatarUrl || currentUser.profile?.avatar_url,
            nombres: currentUser.profile?.nombres || '',
            apellido_paterno: currentUser.profile?.apellido_paterno || '',
            apellido_materno: currentUser.profile?.apellido_materno || '',
            profile_completed: currentUser.profile?.profile_completed || false,
          } as Required<Tables<'profiles'>>,
        });
      }

      setIsEditing(false);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error updating profile: ', error);
      alert('Error al actualizar el perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditGeoClick = () => {
    if (!currentUser?.id) return;

    const lastUpdate: number = new Date(currentUser.profile!.last_geo_update).getTime();

    if (!canUpdateGeoLocation(lastUpdate)) {
      const daysLeft = getDaysUntilNextGeoUpdate(lastUpdate);
      const nextDate = getNextGeoUpdateDate(lastUpdate);
      setGeoUpdateError(
        `Solo puedes actualizar tu ubicación cada 6 meses. Podrás actualizar nuevamente en ${daysLeft} días (${nextDate?.toLocaleDateString('es-PE')}).`
      );
      return;
    }

    setTempDepartment(displayProfile?.geo_department || '');
    setTempProvince(''); // Province will be selected by user since we only have district in DB
    setTempDistrict(displayProfile?.geo_district || '');
    setGeoUpdateError(null);
    setIsEditingGeo(true);
  };

  const handleCancelGeoEdit = () => {
    setIsEditingGeo(false);
    setGeoUpdateError(null);
    setTempDepartment('');
    setTempProvince('');
    setTempDistrict('');
  };

  const handleSaveGeolocation = async () => {
    if (!currentUser?.id || !isOwn) return;
    if (!tempDepartment || !tempProvince || !tempDistrict) {
      setGeoUpdateError('Debes seleccionar departamento, provincia y distrito');
      return;
    }

    setIsUpdatingGeo(true);
    setGeoUpdateError(null);

    try {
      const { error, data } = await db.rpc('update_user_geo_location', {
        p_geo_department: tempDepartment,
        p_geo_district: tempDistrict,
      });

      if (error) throw error;
      if (!data[0].success) throw Error('No se pudo actualizar');

      // Update auth store
      if (currentUser.profile) {
        useAuthStore.getState().setUser({
          ...currentUser,
          profile: {
            ...currentUser.profile,
            last_geo_update: Date(),
            geo_department: tempDepartment,
            geo_district: tempDistrict,
          } as Required<Tables<'profiles'>>,
        });
      }

      setIsEditingGeo(false);
      setTempDepartment('');
      setTempProvince('');
      setTempDistrict('');
    } catch (error) {
      console.error('Error updating geolocation:', error);
      setGeoUpdateError('Error al actualizar la ubicación');
    } finally {
      setIsUpdatingGeo(false);
    }
  };

  const handleTabChange = (newTab: 'projects' | 'events' | 'publications' | 'votes') => {
    setActiveTab(newTab);

    if (onTabChange) {
      onTabChange(internalToUrlTab[newTab]);
    } else {
      updateUrl(internalToUrlTab[newTab]);
    }
  };

  const fetchVotes = useCallback(async () => {
    if (!targetUserId) return;
    const query = db
      .from('project_votes')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching votes:', error);
      setVotes([]);
    } else {
      setVotes(data || []);
    }
  }, [targetUserId]);

  const fetchProjects = useCallback(async () => {
    if (!targetUserId) return;

    const query = db
      .from('projects')
      .select('*')
      .eq('author_id', targetUserId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    // If not own profile, only show public ones
    if (!isOwn) {
      query.eq('visibility', 'public');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } else {
      setProjects(data || []);
    }
  }, [isOwn, targetUserId]);

  const fetchPublications = useCallback(async () => {
    if (!targetUserId) return;

    const query = db
      .from('publications')
      .select('id, title, content, visibility, upvotes, downvotes, impression_count, image_url, published_at, created_at')
      .eq('author_id', targetUserId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    // If not own profile, only show public ones
    if (!isOwn) {
      query.eq('visibility', 'public');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching publications:', error);
      setPublications([]);
    } else {
      setPublications(data || []);
    }
  }, [isOwn, targetUserId]);

  const fetchEvents = useCallback(async () => {
    if (!targetUserId) return;

    const query = db
      .from('events')
      .select('*')
      .eq('author_id', targetUserId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    // If not own profile, only show public ones
    if (!isOwn) {
      query.eq('visibility', 'public');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } else {
      setEvents(data || []);
    }
  }, [isOwn, targetUserId]);

  const fetchUserData = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'projects':
          await fetchProjects();
          break;
        case 'publications':
          await fetchPublications();
          break;
        case 'votes':
          await fetchVotes();
          break;
        case 'events':
          await fetchEvents();
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchEvents, fetchProjects, fetchPublications, fetchVotes, targetUserId]);

  useEffect(() => {
    if (targetUserId && displayProfile) {
      fetchUserData();
    }
  }, [targetUserId, activeTab, displayProfile, fetchUserData]);




  const renderProjects = () => {
    if (projects.length === 0) {
      if (isOwn) {
        return (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes proyectos aún</h3>
            <p className="text-gray-600 mb-4">Comienza creando tu primer proyecto</p>
            <Button variant="red" onClick={() => navigate('/proyectos/crear')}>
              Crear proyecto
            </Button>
          </Card>
        );
      } else {
        return (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos públicos</h3>
            <p className="text-gray-600">Este usuario no ha publicado proyectos aún</p>
          </Card>
        );
      }
    }

    return (
      <div className="space-y-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/proyectos/${project.id}`)}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={(project.image_url ?? [])[0] || '/placeholder.svg?height=80&width=80'}
                  alt="Proyecto"
                  className="w-full sm:w-20 h-48 sm:h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-lg leading-tight flex-1 min-w-0 break-words">
                        {project.title}
                      </h4>
                      {isOwn && (
                        <Badge
                          variant={project.visibility === 'public' ? 'outline' : 'secondary'}
                          className="flex-shrink-0"
                        >
                          {project.visibility === 'public'
                            ? 'Publicado'
                            : project.visibility === 'private'
                              ? 'Privado'
                              : 'Borrador'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{project.content.substring(0, 150)}...</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 flex-shrink-0" />
                      <span>{project.impression_count}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {PE_DISTRICTS[project.geo_district]?.name}, {PE_DEPARTMENTS[project.geo_department]?.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="self-start">
                      {project.ioarr_type}
                    </Badge>
                    <span className="whitespace-nowrap">
                      Creado {new Date(project.created_at).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderPublications = () => {
    if (publications.length === 0) {
      if (isOwn) {
        return (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes publicaciones aún</h3>
            <p className="text-gray-600 mb-4">Comparte tu conocimiento con la comunidad</p>
            <Button variant="red" onClick={() => navigate('/feed/crear')}>
              Crear publicación
            </Button>
          </Card>
        );
      } else {
        return (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay publicaciones públicas</h3>
            <p className="text-gray-600">Este usuario no ha publicado contenido aún</p>
          </Card>
        );
      }
    }

    return (
      <div className="space-y-4">
        {publications.map((publication) => (
          <Card
            key={publication.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/feed/${publication.id}`)}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {publication.image_url && (
                  <img
                    src={publication.image_url || '/placeholder.svg'}
                    alt="Publicación"
                    className="w-full sm:w-20 h-48 sm:h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-lg leading-tight flex-1 min-w-0 break-words">
                        {publication.title}
                      </h4>
                      {isOwn && (
                        <Badge
                          variant={publication.visibility === 'public' ? 'outline' : 'secondary'}
                          className="flex-shrink-0"
                        >
                          {publication.visibility === 'public'
                            ? 'Publicado'
                            : publication.visibility === 'private'
                              ? 'Privado'
                              : 'Borrador'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{publication.content.substring(0, 150)}...</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{publication.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-red-500 rotate-180 flex-shrink-0" />
                      <span>{publication.downvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 flex-shrink-0" />
                      <span>{publication.impression_count}</span>
                    </div>
                    <span className="whitespace-nowrap">
                      Publicado {new Date(publication.published_at).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderEvents = () => {
    if (events.length === 0) {
      if (isOwn) {
        return (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes eventos aún</h3>
            <p className="text-gray-600 mb-4">Organiza eventos para conectar con la comunidad</p>
            <Button variant="red" onClick={() => navigate('/eventos/crear')}>
              Crear evento
            </Button>
          </Card>
        );
      } else {
        return (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos públicos</h3>
            <p className="text-gray-600">Este usuario no ha publicado eventos aún</p>
          </Card>
        );
      }
    }

    return (
      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/eventos/${event.id}`)}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={(event.image_url ?? [])[0] || '/placeholder.svg?height=80&width=80'}
                  alt="Evento"
                  className="w-full sm:w-20 h-48 sm:h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-lg leading-tight flex-1 min-w-0 break-words">{event.title}</h4>
                      {isOwn && (
                        <Badge
                          variant={
                            event.visibility === 'public'
                              ? 'outline'
                              : event.visibility === 'private'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="flex-shrink-0"
                        >
                          {event.visibility === 'public'
                            ? 'Publicado'
                            : event.visibility === 'private'
                              ? 'Privado'
                              : 'Borrador'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{event.content.substring(0, 150)}...</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {new Date(event.event_date).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {PE_DISTRICTS[event.geo_district]?.name}, {PE_DEPARTMENTS[event.geo_department]?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{event.attendees} asistentes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 flex-shrink-0" />
                      <span>{event.impression_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Componente auxiliar para mostrar el nombre del proyecto
  function ProjectName({ projectId }: { projectId: string }) {
    const [projectName, setProjectName] = useState<string>('Cargando...');
    useEffect(() => {
      let isMounted = true;
      db.from('projects')
        .select('title')
        .eq('id', projectId)
        .single()
        .then(({ data, error }) => {
          if (isMounted) {
            setProjectName(error ? 'Proyecto no encontrado' : data?.title || 'Sin nombre');
          }
        });
      return () => { isMounted = false; };
    }, [projectId]);
    return (
      <div className="text-sm text-gray-800 font-medium mb-1">
        Proyecto: {projectName}
      </div>
    );
  }

  const renderVotes = () => (
    <>
      <VotesCountdownCard />
      <div className="space-y-4">
        {votes.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No has votado en ningún proyecto</h3>
            <p className="text-gray-600">Participa en la comunidad votando por proyectos que te interesen</p>
          </Card>
        ) : (
          votes.map((vote) => (
            <Card key={vote.id} className="p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={vote.vote_type === 'golden' ? 'outline' : 'secondary'}>
                    {vote.vote_type === 'golden' ? 'Voto Dorado' : 'Voto Plateado'}
                  </Badge>
                  <span className="text-sm text-gray-600">Cantidad: {vote.votes_count}</span>
                </div>
                <ProjectName projectId={vote.project_id} />
                <span className="text-xs text-gray-500">
                  Votado el {new Date(vote.created_at).toLocaleDateString('es-PE')}
                </span>
              </div>
            </Card>
          ))


        )}
      </div>
    </>
  );
  // ...existing code...

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <p>Cargando...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'projects':
        return renderProjects();
      case 'publications':
        return renderPublications();
      case 'events':
        return renderEvents();
      case 'votes':
        return renderVotes();
      default:
        return null;
    }
  };

  // Loading states
  if (profileLoading) {
    return <p className="text-center py-10">Cargando perfil...</p>;
  }

  // Early return if profile doesn't exist
  if (!displayProfile) {
    if (isOwn) {
      return <p className="text-center py-10">Cargando perfil...</p>;
    } else {
      return <p className="text-center py-10">Usuario no encontrado</p>;
    }
  }

  if (!displayProfile.profile_completed) {
    if (isOwn) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completa tu perfil</h2>
            <p className="text-gray-600 mb-6">
              Necesitas completar tu información de perfil para acceder a esta página.
            </p>
            <Button variant="red" onClick={() => navigate('/completar-registro')}>
              Completar perfil
            </Button>
          </Card>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Perfil no disponible</h2>
            <p className="text-gray-600">Este usuario no ha completado su perfil aún.</p>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* perfil */}
              <Card>
                <div className="p-8">
                  <div className="space-y-4 text-center">
                    <div className="relative mx-auto w-32 sm:w-56 h-32 sm:h-56">
                      <Avatar
                        src={avatarPreview || displayProfile?.avatar_url}
                        alt="Foto de perfil"
                        className="w-32 h-32 sm:w-56 sm:h-56 mx-auto bg-gray-200 flex items-center justify-center"
                      >
                        <User className="w-1/2 h-1/2 text-gray-600" />
                      </Avatar>
                      {isEditing && isOwn && (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                            id="avatar-upload"
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 bg-white p-3 rounded-full shadow-md cursor-pointer hover:bg-gray-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </label>
                        </>
                      )}
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
                        {displayProfile?.nombres} {displayProfile?.apellido_paterno} {displayProfile?.apellido_materno}
                      </h2>
                    </div>
                    {isEditing && isOwn ? (
                      <div className="space-y-4">
                        <textarea
                          value={tempBio}
                          onChange={(e) => setTempBio(e.target.value)}
                          placeholder="Cuéntanos sobre ti..."
                          className="min-h-[100px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="white"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="w-1/2 flex items-center justify-center gap-1 text-sm"
                          >
                            <span>Cancelar</span>
                          </Button>
                          <Button
                            variant="red"
                            onClick={handleSaveProfile}
                            disabled={isUpdating}
                            className="w-1/2 flex items-center justify-center gap-2 text-sm"
                          >
                            {isUpdating ? (
                              'Guardando...'
                            ) : (
                              <>
                                <span>Guardar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {displayProfile?.bio ? (
                          <div className="text-left">
                            <p className="text-gray-700 text-sm whitespace-pre-line">{displayProfile.bio}</p>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-left text-sm italic">
                            {isOwn ? 'No hay descripción aún' : null}
                          </p>
                        )}
                        {isOwn && (
                          <Button
                            variant="red"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleEditClick}
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Editar perfil</span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* contacto */}
                  <div className="space-y-2 py-5">
                    {isEditingGeo && isOwn ? (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-xs">
                          <strong>⚠️ Importante:</strong> Solo puedes actualizar tu ubicación cada 6 meses. Asegúrate de que la información sea correcta antes de guardar.
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Departamento
                          </label>
                          <select
                            value={tempDepartment}
                            onChange={(e) => {
                              setTempDepartment(e.target.value);
                              setTempProvince(''); // Reset province when department changes
                              setTempDistrict(''); // Reset district when department changes
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">Selecciona departamento</option>
                            {DEPARTMENT_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Provincia
                          </label>
                          <select
                            value={tempProvince}
                            onChange={(e) => {
                              setTempProvince(e.target.value);
                              setTempDistrict(''); // Reset district when province changes
                            }}
                            disabled={!tempDepartment}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {!tempDepartment ? 'Selecciona departamento primero' : 'Selecciona provincia'}
                            </option>
                            {tempDepartment && PROVINCES_BY_DEPARTMENT[tempDepartment]?.map((option: { value: string; label: string }) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Distrito
                          </label>
                          <select
                            value={tempDistrict}
                            onChange={(e) => setTempDistrict(e.target.value)}
                            disabled={!tempProvince}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {!tempProvince ? 'Selecciona provincia primero' : 'Selecciona distrito'}
                            </option>
                            {tempProvince && DISTRICTS_BY_PROVINCE[tempProvince]?.map((option: { value: string; label: string }) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {geoUpdateError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                            {geoUpdateError}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="white"
                            onClick={handleCancelGeoEdit}
                            disabled={isUpdatingGeo}
                            className="flex-1 text-xs py-2"
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="red"
                            onClick={handleSaveGeolocation}
                            disabled={isUpdatingGeo || !tempDepartment || !tempProvince || !tempDistrict}
                            className="flex-1 text-xs py-2"
                          >
                            {isUpdatingGeo ? 'Guardando...' : 'Guardar'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {PE_DISTRICTS[displayProfile.geo_district as string]?.name || 'Distrito desconocido'},{' '}
                            {PE_DEPARTMENTS[displayProfile.geo_department as string]?.name || 'Departamento desconocido'}
                          </span>
                        </div>
                        {isOwn && (
                          <Button
                            variant="white"
                            onClick={handleEditGeoClick}
                            className="w-full flex items-center justify-center gap-2 text-xs py-2 mt-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Editar ubicación</span>
                          </Button>
                        )}
                      </div>
                    )}

                    {geoUpdateError && !isEditingGeo && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-md text-xs">
                        {geoUpdateError}
                      </div>
                    )}
                    {isOwn && currentUser && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{currentUser.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Se unió en{' '}
                        {new Date(displayProfile.created_at).toLocaleDateString('es-PE', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* grupitos */}
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Grupos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <span className="text-white text-xs font-bold">P</span>
                      </Avatar>
                      <span className="text-sm font-medium">Peruanista</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* main feed */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Navegación del feed */}
              <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
                <button
                  className={`pb-3 px-1 transition-colors whitespace-nowrap ${activeTab === 'projects'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => handleTabChange('projects')}
                >
                  Proyectos
                </button>
                <button
                  className={`pb-3 px-1 transition-colors whitespace-nowrap ${activeTab === 'events'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => handleTabChange('events')}
                >
                  Eventos
                </button>
                <button
                  className={`pb-3 px-1 transition-colors whitespace-nowrap ${activeTab === 'publications'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => handleTabChange('publications')}
                >
                  Publicaciones
                </button>

                <button
                  className={`pb-3 px-1 transition-colors whitespace-nowrap ${activeTab === 'votes'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => handleTabChange('votes')}
                >
                  Mis Votos
                </button>

              </div>

              {/* contenido dinámico según la tab activa */}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
